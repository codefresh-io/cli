const Command = require('../../../Command');
const CFError = require('cf-errors');
const { prepareKeyValueFromCLIEnvOption } = require('../../../helpers/general');
const createContext = require('../create.cmd');
const { sdk } = require('../../../../../logic');

const command = new Command({
    command: 'config <name>',
    parent: createContext,
    description: 'Create a config context',
    webDocs: {
        category: 'Create Context',
        subCategory: 'Config',
        title: 'Create Config Context',
        weight: 10,
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
            })
            .example('codefresh create context config my-config -v key1=valu1 -v key2=value2', 'Create a config.');

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
                type: 'config',
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

