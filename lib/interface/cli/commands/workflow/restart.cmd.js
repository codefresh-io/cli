const Command = require('../../Command');
const { workflow } = require('../../../../logic/index').api;

const restart = new Command({
    root: true,
    command: 'restart <id>',
    description: 'Restart a workflow by his id',
    builder: (yargs) => {
        return yargs
            .positional('id', {
                describe: 'Workflow id',
            });
    },
    handler: async (argv) => {
        const workflowId = argv.id;
        await workflow.restartWorkflowById(workflowId);
    },
});

module.exports = restart;
