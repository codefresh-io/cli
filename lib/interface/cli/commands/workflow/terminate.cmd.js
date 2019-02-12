const Command = require('../../Command');
const { sdk } = require('../../../../logic');
const Workflow = require('../../../../logic/entities/Workflow');

const terminate = new Command({
    root: true,
    command: 'terminate <id>',
    description: 'Terminate a build by its id',
    usage: 'This command will return once the request has been received from the server.\n The termination process can take time according to the pipeline definition',
    webDocs: {
        category: 'Builds',
        title: 'Terminate Build',
        weight: 40,
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
        const buildResponse = await sdk.workflows.get({ id: workflowId });
        const workflow = Workflow.fromResponse(buildResponse);
        await sdk.progress.terminate({ id: workflow.info.progress });
        console.log(`Build: ${workflowId} terminated`);
    },
});

module.exports = terminate;
