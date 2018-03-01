const CFError = require('cf-errors');
const Command = require('../../Command');
const { crudFilenameOption } = require('../../helpers/general');
const { context, pipeline } = require('../../../../logic').api;
const yargs = require('yargs');

const get = new Command({
    root: true,
    command: 'create',
    description: 'Create a resource from a file or stdin',
    usage: 'Supported resources: \n\t\'Context\'\n\t\'Pipeline\'',
    webDocs: {
        description: 'Create a resource from a file, directory or url',
        category: 'Operate On Resources',
        title: 'Create',
        weight: 20,
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
                await context.createContext(data);
                console.log(`Context: ${name} created`);
                break;
            case 'pipeline':
                await pipeline.createPipeline(data);
                console.log(`Pipeline '${name}' created`);
                break;
            default:
                throw new CFError(`Entity: ${entity} not supported`);
        }

    },
});

module.exports = get;
