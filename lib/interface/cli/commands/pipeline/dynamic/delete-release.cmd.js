const Command = require('../../../Command');
const {
    deleteRelease,
} = require('./../../../../../logic/api/helm');
const { printError } = require('./../../../helpers/general');
const { log } = require('../../../../../logic').api;

const install = new Command({
    root: true,
    command: 'delete-release [name]',
    cliDocs: {
        description: 'Delete helm release',
    },
    builder: (yargs) => {
        return yargs
            .usage('Delete helm release from kubernetes cluster')
            .example('$0 delete-release my-release --cluster my-cluster', 'Delete release "my-release" from cluster "my-cluster"')
            .option('cluster', {
                description: 'Run on cluster',
                type: 'string',
                required: true,
            })
            .option('timeout', {
                description: 'time in seconds to wait for any individual kubernetes operation (like Jobs for hooks) (default 300)',
                default: '300',
                type: 'number',
            })
            .option('purge', {
                description: 'remove the release from the store and make its name free for later use (default true)',
                default: false,
                type: 'boolean',
            })
            .option('no-hooks', {
                description: 'prevent hooks from running during deletion',
                default: false,
                type: 'boolean',
            });
    },
    handler: async (argv) => {
        const releaseName = argv.name;
        if (!releaseName) {
            throw new Error('Release name is required');
        }
        try {
            const workflowId = await deleteRelease({
                releaseName,
                cluster: argv.cluster,
                timeout: argv.timeout,
                purge: argv.purge,
                noHooks: argv.noHooks,
            });
            console.log(`Started with id: ${workflowId}`);
            await log.showWorkflowLogs(workflowId, true);
            process.exit(0);
        } catch (err) {
            printError(err);
            process.exit(1);
        }
    },
});

module.exports = install;
