const Command = require('../../Command');
const { workflow } = require('../../../../logic/index').api;
const { log } = require('../../../../logic').api;

const restart = new Command({
    root: true,
    command: 'restart <id>',
    description: 'Restart a workflow by his id',
    builder: (yargs) => {
        return yargs
            .positional('id', {
                describe: 'Workflow id',
            })
            .option('detach', {
                alias: 'd',
                describe: 'Run workflow and print workflow ID',
            });
    },
    handler: async (argv) => {
        const workflowId = await workflow.restartWorkflowById(argv.id);
        if (argv.detach) {
            console.log(workflowId);
        } else {
            await log.showWorkflowLogs(workflowId, true);
            const workflowInstance = await workflow.getWorkflowById(workflowId);
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
    },
});

module.exports = restart;
