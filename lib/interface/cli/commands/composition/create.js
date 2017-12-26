const debug = require('debug')('codefresh:cli:create:context');
const Command = require('../../Command');
const CFError = require('cf-errors');
const _ = require('lodash');
const { wrapHandler, prepareKeyValueCompostionFromCLIEnvOption, printError } = require('../../helpers/general');
const { composition } = require('../../../../logic').api;
const fs = require('fs');


const command = new Command({
    command: 'composition [name]',
    description: 'Create a composition',
    builder: (yargs) => {
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
            .option('yaml', {
                describe: 'Path to yaml file to use to create the resource',
            })
            .coerce('yaml', (arg) => {
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
            });
    },
    handler: async (argv) => {
        const data = argv.filename || {
            name: argv.name,
            vars: prepareKeyValueCompostionFromCLIEnvOption(argv.variable),
            yamlJson: argv.yaml,
            isAdvanced: argv.advanced,
        };

        await composition.createComposition(data);
        console.log(`Composition: ${data.name} created`);
    },
});


module.exports = command;
