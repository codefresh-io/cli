const Command = require('../../Command');
const { crudFilenameOption } = require('../../helpers/general');

const restart = new Command({
    root: true,
    command: 'restart <id>',
    description: 'Restart one resource',
    builder: (yargs) => {
        // TODO add default command in case of no <resource>
        // TODO should we define all possible resources in this level???
        yargs
            .usage('Restart one resource\n\n' +
                'Available Resources:\n' +
                '  * workflows (aka \'wf\')\n')
            .example('$0 restart workflow [workflowId]', '# Restart a specific workflow')
            .positional('id', {
                describe: 'Workflow id',
            });

        return yargs
            .demandCommand(1, 'You need at least one command before moving on');
    },
});

module.exports = restart;
