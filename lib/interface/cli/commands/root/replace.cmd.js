const CFError = require('cf-errors');
const Command = require('../../Command');
const { crudFilenameOption } = require('../../helpers/general');
const yargs = require('yargs');

const annotate = new Command({
    root: true,
    command: 'replace',
    description: 'Replace a resource by filename or stdin',
    usage: 'Replace operation will completely overwrite the existing resource and will throw an error if the resource does not exist.\n\n Supported resources: \n\t\'Context\'',
    webDocs: {
        description: 'Replace a resource from a file, directory or url',
        category: 'Operate On Resources',
        title: 'Replace',
        weight: 80,
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

module.exports = annotate;
