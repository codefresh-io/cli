const Command = require('../../../Command');
const CFError = require('cf-errors');
const { prepareKeyValueFromCLIEnvOption } = require('../../../helpers/general');
const createContext = require('../create.cmd');
const { sdk } = require('../../../../../logic');

const command = new Command({
    command: 'secret-yaml <name>',
    parent: createContext,
    description: 'Create a secret-yaml context',
    webDocs: {
        category: 'Create Context',
        subCategory: 'Secret Yaml',
        title: 'Create Secret-Yaml Context',
        weight: 30,
    },
    builder: (yargs) => {
        yargs
            .positional('name', {
                describe: 'Name of context',
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
            metadata: {
                name: argv.name,
            },
            spec: {
                type: 'secret-yaml',
                data: prepareKeyValueFromCLIEnvOption(argv.variable),
            },
        };

        if (!data.metadata.name || !data.spec.type) {
            throw new CFError('Name and type must be provided');
        }

        await sdk.contexts.create(data);
        console.log(`Context: ${data.metadata.name} created`);
    },
});

module.exports = command;

