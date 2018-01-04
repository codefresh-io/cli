const Command = require('../../Command');
const { crudFilenameOption } = require('../../helpers/general');

const terminate = new Command({
    root: true,
    command: 'terminate <id>',
    description: 'Terminate one resource',
    builder: (yargs) => {
        // TODO add default command in case of no <resource>
        // TODO should we define all possible resources in this level???
        yargs
            .usage('Terminate one resource\n\n' +
                'Available Resources:\n' +
                '  * workflows (aka \'wf\')\n')
            .example('$0 terminate workflow [workflowId]', '# Terminate a specific workflow')
            .positional('id', {
                describe: 'Workflow id',
            });

        return yargs
            .demandCommand(1, 'You need at least one command before moving on');
    },
});

module.exports = terminate;
