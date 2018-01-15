const debug = require('debug')('codefresh:auth:get-contexts');
const Command = require('../../Command');
const _ = require('lodash');
const { printTableForAuthContexts } = require('../../helpers/auth');
const authRoot = require('../root/auth.cmd');

const command = new Command({
    command: 'get-contexts',
    parent: authRoot,
    cliDocs: {
        description: 'Get all possible authentication contexts',
    },
    webDocs: {
        category: 'Authentication',
        title: 'Get all contexts',
    },
    builder: (yargs) => {
        return yargs;
    },
    handler: async (argv) => {
        printTableForAuthContexts();
    },
});


module.exports = command;
