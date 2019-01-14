const debug = require('debug')('codefresh:cli:create:context');
const Command = require('../../Command');
const CFError = require('cf-errors');
const _ = require('lodash');
const { prepareKeyValueCompostionFromCLIEnvOption, printError } = require('../../helpers/general');
const { composition } = require('../../../../logic').api;
const fs = require('fs');
const createRoot = require('../root/create.cmd');
const { crudFilenameOption } = require('../../helpers/general');


const command = new Command({
    command: 'composition <name>',
    aliases: ['com'],
    parent: createRoot,
    description: 'Create a composition',
    webDocs: {
        category: 'Compositions',
        title: 'Create Composition',
    },
    builder: (yargs) => {
        crudFilenameOption(yargs);
        return yargs
            .positional('name', {
                describe: 'Name of composition',
            })
            .option('variable', {
                describe: 'Variables list',
                default: [],
                alias: 'v',
            })
            .option('advanced', {
                describe: 'Advanced composition',
                default: false,
                type: 'boolean',
            })
            .option('compose-file', {
                describe: 'Path to docker-compose.yaml file to use to create the resource',
                alias: 'c',
                required: true,
            })
            .coerce('compose-file', (arg) => {
                try {
                    return fs.readFileSync(arg, 'utf8');
                } catch (err) {
                    const error = new CFError({
                        message: 'Failed to read file',
                        cause: err,
                    });
                    printError(error);
                    process.exit(1);
                }
            })
            .example('codefresh create composition NAME --compose-file ./docker-compose.yml', 'Creating a composition using a docker-compose.yml file')
            .example('codefresh create composition NAME --compose-file ./docker-compose.yml -v key1=value1 -v key2=value2', 'Defining composition variables');

    },
    handler: async (argv) => {
        const data = argv.filename || {
            name: argv.name,
            vars: prepareKeyValueCompostionFromCLIEnvOption(argv.variable),
            yamlJson: argv['compose-file'],
            isAdvanced: argv.advanced,
        };

        await composition.createComposition(data);
        console.log(`Composition: ${data.name} created`);
    },
});


module.exports = command;
