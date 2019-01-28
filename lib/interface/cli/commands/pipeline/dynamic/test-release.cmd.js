const Command = require('../../../Command');
const {
    testRelease,
} = require('./../../../../../logic/api/helm');
const { printError } = require('./../../../helpers/general');
const { log } = require('../../../../../logic').api;

const { sdk } = require('../../../../../logic');
const Workflow = require('../../../../../logic/entities/Workflow');

const install = new Command({
    root: true,
    command: 'test-release [name]',
    description: 'Test a helm release',
    webDocs: {
        category: 'Predefined Pipelines',
        title: 'Test Helm Release',
        weight: 30,
    },
    builder: (yargs) => {
        return yargs
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

            if (argv.detach) {
                console.log(workflowId);
            } else {
                await log.showWorkflowLogs(workflowId, true);
                const json = await sdk.workflows.get({ id: workflowId });
                const workflowInstance = Workflow.fromResponse(json);
                switch (workflowInstance.getStatus()) {
                    case 'success':
                        process.exit(0);
                        break;
                    case 'error':
                        process.exit(1);
                        break;
                    case 'terminated':
                        process.exit(2);
                        break;
                    default:
                        process.exit(100);
                        break;
                }
            }
        } catch (err) {
            printError(err);
            process.exit(1);
        }
    },
});

module.exports = install;
