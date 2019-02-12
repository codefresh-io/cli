const CFError = require('cf-errors');
const Command = require('../../Command');
const { crudFilenameOption } = require('../../helpers/general');
const yargs = require('yargs');
const { validatePipelineSpec } = require('../../helpers/validation');
const { sdk } = require('../../../../logic');

const get = new Command({
    root: true,
    command: 'create',
    description: 'Create a resource from a file or stdin',
    usage: 'Supported resources: \n\t\'context\'\n\t\'pipeline\'',
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
            return;
        }

        const data = argv.filename;
        const entity = data.kind;

        const name = data.metadata.name;
        if (!name) {
            throw new CFError("Name is missing");
        }

        switch (entity) {
            case 'context':
                await sdk.contexts.create(data);
                console.log(`Context: ${name} created`);
                break;
            case 'pipeline':
                const result = await validatePipelineSpec(data);
                if (!result.valid) {
                    console.warn(result.message);
                    return;
                }
                await sdk.pipelines.create(data);
                console.log(`Pipeline '${name}' created`);
                break;
            default:
                throw new CFError(`Entity: ${entity} not supported`);
        }
    },
});

module.exports = get;
