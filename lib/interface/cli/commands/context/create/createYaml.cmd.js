const debug = require('debug')('codefresh:cli:create:context');
const Command = require('../../../Command');
const CFError = require('cf-errors');
const _ = require('lodash');
const { prepareKeyValueFromCLIEnvOption, crudFilenameOption } = require('../../../helpers/general');
const { context } = require('../../../../../logic/index').api;
const createContext = require('../create.cmd');

const command = new Command({
    command: 'yaml <name>',
    parent: createContext,
    description: 'Create a yaml context',
    webDocs: {
        category: 'Create Context',
        subCategory : 'Yaml',
        title: 'Create Yaml Context',
        weight: 40,
    },
    builder: (yargs) => {
        yargs
            .positional('name', {
                describe: 'Name of context',
            })
            .option('owner', {
                describe: 'Owner of the context',
                choices: ['user', 'account'],
                default: 'account',
            })
            .option('variable', {
                describe: 'Variables list',
                default: [],
                alias: 'v',
            });

        return yargs;
    },
    handler: async (argv) => {
        const data = {
            apiVersion: 'v1',
            kind: 'context',
            owner: argv.owner,
            metadata: {
                name: argv.name,
            },
            spec: {
                type: 'yaml',
                data: prepareKeyValueFromCLIEnvOption(argv.variable),
            },
        };

        if (!data.metadata.name || !data.spec.type) {
            throw new CFError('Name and type must be provided');
        }

        await context.createContext(data);
        console.log(`Context: ${data.metadata.name} created`);
    },
});

module.exports = command;

