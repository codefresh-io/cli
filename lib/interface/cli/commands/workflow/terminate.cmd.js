const Command = require('../../Command');
const { workflow } = require('../../../../logic/index').api;

const terminate = new Command({
    root: true,
    command: 'terminate <id>',
    description: 'Terminate a workflow by its id',
    builder: (yargs) => {
        return yargs
            .positional('id', {
                describe: 'Workflow id',
            });
    },
    handler: async (argv) => {
        const workflowId = argv.id;
        await workflow.terminateWorkflowById(workflowId);
    },
});

module.exports = terminate;
