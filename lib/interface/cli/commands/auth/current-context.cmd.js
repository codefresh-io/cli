const debug = require('debug')('codefresh:auth:current-context');
const Command = require('../../Command');
const CFError = require('cf-errors');
const { auth } = require('../../../../logic');
const authManager = auth.manager;
const authRoot = require('../root/auth.cmd');
const { printTableForAuthContexts } = require('../../helpers/auth');
const _ = require('lodash');

const command = new Command({
    command: 'current-context',
    parent: authRoot,
    description: 'Get the current activated authentication context',
    webDocs: {
        category: 'Authentication',
        title: 'Get Activated Context',
        weight: 30,
    },
    builder: (yargs) => {
        return yargs
            .example('codefresh auth current-context', 'Show active authentication context');
    },
    handler: async (argv) => {
        const currentContext = authManager.getCurrentContext();
        if (_.isUndefined(currentContext)) {
            throw new CFError('There are no contexts in cfconfig file');
        }
        if (currentContext) {
            await printTableForAuthContexts({ filter: 'current' });
        }
    },
});

module.exports = command;
