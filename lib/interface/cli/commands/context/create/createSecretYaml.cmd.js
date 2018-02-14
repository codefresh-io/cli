const debug = require('debug')('codefresh:cli:create:context:secret-yaml');
const Command = require('../../../Command');
const CFError = require('cf-errors');
const { context } = require('../../../../../logic/index').api;
const createContext = require('../create.cmd');

const command = new Command({
    command: 'secret-yaml <name>',
    parent: createContext,
    description: 'Create a secret-yaml context',
    webDocs: {
        category: 'Create Context',
        subCategory : 'Secret Yaml',
        title: 'Create Secret-Yaml Context',
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
            .option('filename', {
                describe: 'Path to yaml file with values',
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
                type: 'secret-yaml',
                data: argv.filename,
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

