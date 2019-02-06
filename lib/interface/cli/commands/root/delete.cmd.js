const CFError = require('cf-errors');
const Command = require('../../Command');
const { crudFilenameOption } = require('../../helpers/general');
const yargs = require('yargs');
const { sdk } = require('../../../../logic');


const get = new Command({
    root: true,
    command: 'delete',
    description: 'Delete a resource by file or resource name',
    usage: 'Supported resources: \n\t\'Context\'\n\t\'Pipeline\'',
    webDocs: {
        description: 'Delete a resource from a file, directory or url',
        category: 'Operate On Resources',
        title: 'Delete',
        weight: 30,
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
            throw new CFError('Name is missing');
        }

        switch (entity) {
            case 'context':
                await sdk.contexts.delete({ name });
                console.log(`Context: ${name} deleted`);
                break;
            case 'pipeline':
                await sdk.pipelines.delete({ name });
                console.log(`Pipeline '${name}' deleted`);
                break;
            default:
                throw new CFError(`Entity: ${entity} not supported`);
        }

    },
});

module.exports = get;
