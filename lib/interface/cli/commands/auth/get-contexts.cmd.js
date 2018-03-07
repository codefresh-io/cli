const debug = require('debug')('codefresh:auth:get-contexts');
const Command = require('../../Command');
const _ = require('lodash');
const { printTableForAuthContexts } = require('../../helpers/auth');
const authRoot = require('../root/auth.cmd');

const command = new Command({
    command: 'get-contexts',
    parent: authRoot,
    description: 'Get all possible authentication contexts',
    webDocs: {
        category: 'Authentication',
        title: 'Get Contexts',
        weight: 10,
    },
    builder: (yargs) => {
        return yargs
            .example('codefresh auth get-contexts', 'List all existing authentication contexts');
    },
    handler: async (argv) => {
        let output = await printTableForAuthContexts({filter:"all"});
        console.log(output);
    },
});


module.exports = command;
