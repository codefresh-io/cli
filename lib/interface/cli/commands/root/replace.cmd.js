const CFError = require('cf-errors');
const Command = require('../../Command');
const { crudFilenameOption } = require('../../helpers/general');
const { context, pipeline } = require('../../../../logic').api;
const yargs = require('yargs');

const annotate = new Command({
    root: true,
    command: 'replace',
    description: 'Replace a resource by filename',
    usage: 'Supported resources: \n\t\'Context\'\n\t\'Pipeline\'',
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

        const name = data.metadata.name;
        if (!name) {
            throw new CFError("Name is missing");
        }

        switch (entity) {
            case 'context':
                await context.replaceByName(name, data);
                console.log(`Context: ${name} created`);
                break;
            case 'pipeline':
                await pipeline.replaceByName(name, data);
                console.log(`Pipeline '${name}' updated`);
                break;
            default:
                throw new CFError(`Entity: ${entity} not supported`);
        }

    },
});

module.exports = annotate;
