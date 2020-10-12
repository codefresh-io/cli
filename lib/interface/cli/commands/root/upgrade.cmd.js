const CFError = require('cf-errors');
const Command = require('../../Command');
const { crudFilenameOption } = require('../../helpers/general');
const yargs = require('yargs');


const upgrade = new Command({
    root: true,
    command: 'upgrade',
    description: 'Upgrade a resource by filename or stdin',
    usage: 'Upgrade operation will apply only passed changes to an existing resource and will throw an error if the resource does not exist.\n\n Supported resources: \n\t\'Context\'',
    webDocs: {
        description: 'Upgrade a resource from a file, directory or url',
        category: 'Operate On Resources',
        title: 'Upgrade',
        weight: 40,
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

module.exports = upgrade;
