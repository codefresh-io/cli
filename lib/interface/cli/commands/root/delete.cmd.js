const Command = require('../../Command');
const { crudFilenameOption } = require('../../helpers/general');


const get = new Command({
    root: true,
    command: 'delete',
    cliDocs: {
        description: 'Delete a resource by file or resource name',
    },
    builder: (yargs) => {
        // TODO add default command in case of no <resource>
        // TODO should we define all possible resources in this level???
        yargs
            .usage('Delete a resource by file or resource name\n\n' +
                'Available Resources:\n' +
                '  * context\n' +
                '  * image')
            .example('$0 delete -f ./filename', '# Delete a resource from FILE')
            .example('$0 delete context -f ./filename', '# Delete a context from FILE')
            .example('$0 delete context name', '# Delete a context by NAME');

        crudFilenameOption(yargs);

        return yargs
            .demandCommand(1, 'You need at least one command before moving on');
    },
});

module.exports = get;
