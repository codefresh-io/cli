const Command = require('../../../Command');
const { printError } = require('./../../../helpers/general');
const { sdk } = require('../../../../../logic');
const { followLogs } = require('./../../../helpers/workflow');

const install = new Command({
    root: true,
    command: 'delete-release <name>',
    description: 'Delete a helm release from a kubernetes cluster',
    webDocs: {
        category: 'Predefined Pipelines',
        title: 'Delete Helm Release',
        weight: 10,
    },
    builder: (yargs) => {
        return yargs
            .option('cluster', {
                description: 'Run on cluster',
                type: 'string',
                required: true,
                alias: 'c',
            })
            .option('timeout', {
                description: 'time in seconds to wait for any individual kubernetes operation (like Jobs for hooks) (default 300)',
                default: '300',
                type: 'number',
                alias: 't',
            })
            .option('purge', {
                description: 'remove the release from the store and make its name free for later use (default true)',
                default: false,
                type: 'boolean',
                alias: 'p',
            })
            .option('detach', {
                alias: 'd',
                describe: 'Run pipeline and print build ID',
            })
            .option('no-hooks', {
                description: 'prevent hooks from running during deletion',
                default: false,
                type: 'boolean',
                alias: 'nh',
            })
            .option('tiller-namespace', {
                description: 'prevent hooks from running during deletion',
                type: 'string',
                alias: 'n',
                default: 'kube-system',
            })
            .example('codefresh delete-release my-release --cluster my-cluster', 'Delete release "my-release" from cluster "my-cluster"');
    },
    handler: async (argv) => {
        const {
            name: releaseName,
            purge,
            noHooks,
            timeout,
            cluster,
            tillerNamespace,
        } = argv;

        if (!releaseName) {
            throw new Error('Release name is required');
        }

        try {
            const result = await sdk.helm.releases.delete({
                releaseName,
                selector: cluster,
                tillerNamespace,
            }, {
                purge,
                timeout,
                noHooks,
            });
            const workflowId = result.id;

            if (argv.detach) {
                console.log(workflowId);
                return;
            }
            await followLogs(workflowId);
        } catch (err) {
            printError(err);
            process.exit(1);
        }
    },
});

module.exports = install;
