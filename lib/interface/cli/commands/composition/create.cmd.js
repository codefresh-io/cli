const Command = require('../../Command');
const CFError = require('cf-errors');
const _ = require('lodash');
const { prepareKeyValueObjectsFromCLIEnvOption } = require('../../helpers/general');
const createRoot = require('../root/create.cmd');
const { crudFilenameOption } = require('../../helpers/general');
const { sdk } = require('../../../../logic');


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
        crudFilenameOption(yargs, {
            name: 'compose-file',
            describe: 'Path to docker-compose.yaml file to use to create the resource',
            alias: 'c',
            required: true,
            raw: true,
        });
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
                alias: 'a',
            })
            .example('codefresh create composition NAME --compose-file ./docker-compose.yml', 'Creating a composition using a docker-compose.yml file')
            .example('codefresh create composition NAME --compose-file ./docker-compose.yml -v key1=value1 -v key2=value2', 'Defining composition variables');

    },
    handler: async (argv) => {
        const data = argv.filename || {
            name: argv.name,
            vars: prepareKeyValueObjectsFromCLIEnvOption(argv.variable),
            yamlJson: argv['compose-file'],
            isAdvanced: argv.advanced,
        };

        const name = _.get(data, 'name');

        if (!name) {
            throw new CFError('Missing name of the composition');
        }

        await sdk.compositions.create(data);
        console.log(`Composition: '${data.name}' created`);
    },
});


module.exports = command;
