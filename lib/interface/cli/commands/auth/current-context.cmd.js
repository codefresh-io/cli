const debug = require('debug')('codefresh:auth:current-context');
const Command = require('../../Command');
const CFError = require('cf-errors');
const { auth } = require('../../../../logic');
const authManager = auth.manager;
const authRoot = require('../root/auth.cmd');


const command = new Command({
    command: 'current-context',
    description: 'current-context',
    category: 'Authentication',
    parent: authRoot,
    builder: (yargs) => {
        return yargs;
    },
    handler: async (argv) => {
        const currentContext = authManager.getCurrentContext();
        if (currentContext) {
            console.log(currentContext.getName());
        } else {
            throw new CFError('There are no contexts in cfconfig file');
        }
    },
});

module.exports = command;
