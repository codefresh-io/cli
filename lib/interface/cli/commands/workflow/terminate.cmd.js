const Command = require('../../Command');
const { workflow } = require('../../../../logic/index').api;

const terminate = new Command({
    root: true,
    command: 'terminate <id>',
    description: 'Terminate a build by its id',
    usage: 'This command will return once the request has been received from the server.\n The termination process can take time according to the pipeline definition',
    webDocs: {
        category: 'Builds',
        title: 'Terminate Build',
    },
    builder: (yargs) => {
        return yargs
            .positional('id', {
                describe: 'Build id',
            })
            .example('codefresh terminate ID', 'Terminate build ID');
    },
    handler: async (argv) => {
        const workflowId = argv.id;
        await workflow.terminateWorkflowById(workflowId);
        console.log(`Build: ${workflowId} terminated`);
    },
});

module.exports = terminate;
