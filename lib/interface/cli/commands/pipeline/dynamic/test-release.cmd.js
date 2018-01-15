const Command = require('../../../Command');
const {
    testRelease,
} = require('./../../../../../logic/api/helm');
const { printError } = require('./../../../helpers/general');
const { log } = require('../../../../../logic').api;

const install = new Command({
    root: true,
    command: 'test-release [name]',
    cliDocs: {
        description: 'Test a helm release',
    },
    webDocs: {
        category: 'Predefined Pipelines',
        title: 'Test a helm release',
    },
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
                type: 'number',
            })
            .option('cleanup', {
                description: 'delete test pods upon completion (default false)',
                default: 'false',
                type: 'boolean',
            });
    },
    handler: async (argv) => {
        const releaseName = argv.name;
        if (!releaseName) {
            throw new Error('Release name is required');
        }
        try {
            const workflowId = await testRelease({
                releaseName,
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
