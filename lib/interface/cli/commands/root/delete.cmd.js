const CFError = require('cf-errors');
const Command = require('../../Command');
const { crudFilenameOption } = require('../../helpers/general');
const yargs = require('yargs');


const get = new Command({
    root: true,
    command: 'delete',
    description: 'Delete a resource by file or resource name',
    usage: 'Supported resources:',
    webDocs: {
        description: 'Delete a resource from a file, directory or url',
        category: 'Operate On Resources',
        title: 'Delete',
        weight: 50,
    },
    builder: (yargs) => {
        crudFilenameOption(yargs);
        return yargs;
    },
    handler: async (argv) => {
        if (!argv.filename) {
            yargs.showHelp();
        }

        const data = argv.filename;
        const entity = data.kind;

        switch (entity) {
            default:
                throw new CFError(`Entity: ${entity} not supported`);
        }

    },
});

module.exports = get;
