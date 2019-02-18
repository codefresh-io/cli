const debug = require('debug')('codefresh:auth:use-context');
const Command = require('../../Command');
const CFError = require('cf-errors');
const { Config } = require('codefresh-sdk');
const authRoot = require('../root/auth.cmd');


const command = new Command({
    command: 'use-context <name>',
    parent: authRoot,
    description: 'Set the current active authentication context',
    webDocs: {
        category: 'Authentication',
        title: 'Set Active Context',
        weight: 40,
    },
    builder: (yargs) => {
        return yargs
            .positional('name', {
                describe: 'a context-name that exists in cfconfig file',
                type: 'string',
            })
            .example('codefresh auth use-context NAME', 'Set active authentication context to NAME');

    },
    handler: async (argv) => {
        const contextName = argv.name;

        const configManager = Config.manager();

        const context = configManager.getContextByName(contextName);
        if (context) {
            configManager.setCurrentContext(context);
            configManager.persistConfig();
            console.log(`Switched to context ${contextName}`);
        } else {
            throw new CFError(`No context exists with the name: ${contextName}`);
        }
    },
});

module.exports = command;
