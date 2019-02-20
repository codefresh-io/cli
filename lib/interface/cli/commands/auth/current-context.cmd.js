const Command = require('../../Command');
const authRoot = require('../root/auth.cmd');
const { Config } = require('codefresh-sdk');
const { printTableForAuthContexts } = require('../../helpers/auth');

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
        await Config.manager().loadConfig(argv.cfconfig);
        await printTableForAuthContexts({ filter: 'current' });
    },
});

module.exports = command;
