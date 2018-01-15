const debug = require('debug')('codefresh:auth:use-context');
const Command = require('../../Command');
const CFError = require('cf-errors');
const _ = require('lodash');
const { auth } = require('../../../../logic');
const authManager = auth.manager;
const authRoot = require('../root/auth.cmd');


const command = new Command({
    command: 'use-context <name>',
    parent: authRoot,
    cliDocs: {
        description: 'Set the current active authentication context',
    },
    webDocs: {
        category: 'Authentication',
        title: 'Set active context',
    },
    builder: (yargs) => {
        return yargs
            .positional('context-name', {
                describe: 'a context-name that exists in cfconfig file',
                type: 'string',
            });
    },
    handler: async (argv) => {
        const contextName = argv.name;

        const context = authManager.getContextByName(contextName);
        if (context) {
            authManager.setCurrentContext(context);
            authManager.persistContexts();
            console.log(`Switched to context ${contextName}`);
        } else {
            throw new CFError(`No context exists with the name: ${contextName}`);
        }
    },
});

module.exports = command;
