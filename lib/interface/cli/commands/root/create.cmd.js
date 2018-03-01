const CFError = require('cf-errors');
const Command = require('../../Command');
const { crudFilenameOption } = require('../../helpers/general');
const { context, pipeline2 } = require('../../../../logic').api;
const yargs = require('yargs');

const get = new Command({
    root: true,
    command: 'create',
    description: 'Create a resource from a file or stdin',
    usage: 'Supported resources: \n\t\'Context\'',
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

        switch (entity) {
            case 'context':
                await context.createContext(data);
                console.log(`Context: ${data.metadata.name} created`);
                break;
            case 'pipeline':
                await pipeline2.createPipeline(data);
                console.log(`Pipeline '${data.metadata.name}' created`);
                break;
            default:
                throw new CFError(`Entity: ${entity} not supported`);
        }

    },
});

module.exports = get;
