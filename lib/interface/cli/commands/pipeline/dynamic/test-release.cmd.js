const Command = require('../../../Command');
const { followLogs } = require('./../../../helpers/workflow');
const { sdk } = require('../../../../../logic');
const Output = require('../../../../../output/Output');

const install = new Command({
    root: true,
    command: 'test-release <name>',
    description: 'Test a helm release',
    webDocs: {
        category: 'Predefined Pipelines',
        title: 'Test Helm Release',
        weight: 30,
    },
    builder: (yargs) => {
        return yargs
            .positional('name', {
                description: 'Release name',
                type: 'string',
                required: true,
            })
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
            .option('detach', {
                alias: 'd',
                describe: 'Run pipeline and print build ID',
            })
            .option('cleanup', {
                description: 'delete test pods upon completion (default false)',
                default: 'false',
                type: 'boolean',
            });
    },
    handler: async (argv) => {
        const {
            name: releaseName,
            cluster,
            cleanup,
            timeout,
        } = argv;
        if (!releaseName) {
            throw new Error('Release name is required');
        }
        try {
            const result = await sdk.helm.releases.test({
                releaseName,
                selector: cluster,
            }, {
                cleanup,
                timeout,
            });
            const workflowId = result.id;

            if (argv.detach) {
                console.log(workflowId);
                return;
            }
            await followLogs(workflowId);
        } catch (err) {
            Output.printError(err);
            process.exit(1);
        }
    },
});

module.exports = install;
