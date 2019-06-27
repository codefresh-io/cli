const CFError = require('cf-errors');
const Command = require('../../Command');
const { crudFilenameOption } = require('../../helpers/general');
const yargs = require('yargs');
const { validatePipelineSpec } = require('../../helpers/validation');
const { sdk } = require('../../../../logic');

const annotate = new Command({
    root: true,
    command: 'replace',
    description: 'Replace a resource by filename',
    usage: 'Supported resources: \n\t\'Context\'\n\t\'Pipeline\'\'\n\t\'Step-type\'',
    webDocs: {
        description: 'Replace a resource from a file, directory or url',
        category: 'Operate On Resources',
        title: 'Replace',
        weight: 80,
    },
    builder: (yargs) => {
        crudFilenameOption(yargs);
        yargs.option('skip-trigger-validation', {
            describe: 'Set to true to skip validation (for pipeline replace)',
            type: 'boolean',
            default: false,
        });
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
                await sdk.contexts.replace({ name }, data);
                console.log(`Context: ${name} updated`);
                break;
            case 'pipeline':
                const result = await validatePipelineSpec(data);
                if (!result.valid) {
                    console.warn(result.message);
                    return;
                }
                await sdk.pipelines.replace({
                    name,
                    disableRevisionCheck: true,
                    skipTriggerValidation: argv.skipTriggerValidation || undefined,
                }, data);
                console.log(`Pipeline '${name}' updated`);
                break;
            case 'step-type':
                await sdk.steps.replace({
                    name,
                }, data);
                console.log(`Step-type '${name}' updated`);
                break;
            default:
                throw new CFError(`Entity: ${entity} not supported`);
        }

    },
});

module.exports = annotate;
