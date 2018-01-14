const Command = require('../../Command');
const { workflow } = require('../../../../logic/index').api;

const terminate = new Command({
    root: true,
    command: 'terminate <id>',
    description: 'Terminate a build by its id',
    category: 'Builds',
    builder: (yargs) => {
        return yargs
            .positional('id', {
                describe: 'Build id',
            });
    },
    handler: async (argv) => {
        const workflowId = argv.id;
        await workflow.terminateWorkflowById(workflowId);
        console.log(`Build: ${workflowId} terminated`);
    },
});

module.exports = terminate;
