const Command = require('../../../Command');
const {
    testRelease,
} = require('./../../../../../logic/api/helm');
const { printError } = require('./../../../helpers/general');
const { log } = require('../../../../../logic').api;

const install = new Command({
    root: true,
    command: 'test-release',
    description: 'Test helm releaes',
    builder: (yargs) => {
        return yargs
            .usage('Test helm relaese')
            .option('cluster', {
                description: 'Install on cluster',
                type: 'string',
                required: true,
            })
            .option('timeout', {
                description: 'time in seconds to wait for any individual kubernetes operation (like Jobs for hooks) (default 300)',
                default: '300',
                type: 'integer',
            })
            .option('cleanup', {
                description: 'delete test pods upon completion (default false)',
                default: 'false',
                type: 'boolean',
            })
            .option('release-name', {
                description: 'The name to set to the release',
                type: 'string',
                required: true,
            });
    },
    handler: async (argv) => {
        try {
            const workflowId = await testRelease({
                releaseName: argv.releaseName,
                cluster: argv.cluster,
                cleanup: argv.cleanup,
                timeout: argv.timeout,
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
