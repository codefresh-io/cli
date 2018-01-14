const debug = require('debug')('codefresh:auth:get-contexts');
const Command = require('../../Command');
const _ = require('lodash');
const { printTableForAuthContexts } = require('../../helpers/auth');
const authRoot = require('../root/auth.cmd');

const command = new Command({
    command: 'get-contexts',
    description: 'get-contexts',
    category: 'Authentication',
    parent: authRoot,
    builder: (yargs) => {
        return yargs;
    },
    handler: async (argv) => {
        printTableForAuthContexts();
    },
});


module.exports = command;
