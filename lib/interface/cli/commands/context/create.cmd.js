const debug = require('debug')('codefresh:cli:create:context');
const Command = require('../../Command');
const CFError = require('cf-errors');
const _ = require('lodash');
const { prepareKeyValueFromCLIEnvOption } = require('../../helpers/general');
const { context } = require('../../../../logic').api;
const createRoot = require('../root/create.cmd');

const command = new Command({
    command: 'context [type] [name]',
    aliases: ['ctx'],
    description: 'Create a context',
    builder: (yargs) => {
        return yargs
            .positional('name', {
                describe: 'Name of context',
            })
            .positional('type', {
                describe: 'Type of the context',
                choices: ['config', 'secret', 'helm-repository', 'helm-plain-text-values'],
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
    },
    handler: async (argv) => {
        const data = argv.filename || {
            apiVersion: 'v1',
            kind: 'context',
            owner: argv.owner,
            metadata: {
                name: argv.name,
            },
            spec: {
                type: argv.type,
                data: prepareKeyValueFromCLIEnvOption(argv.variable),
            }
        };

        if (!data.metadata.name || !data.spec.type) {
            throw new CFError('Name and type must be provided');
        }

        await context.createContext(data);
        console.log(`Context: ${data.metadata.name} created`);
    },
});
createRoot.subCommand(command);



module.exports = command;

