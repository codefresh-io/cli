const Command = require('../../Command');
const createRoot = require('../root/create.cmd');
const yargs = require('yargs');

const command = new Command({
    command: 'context',
    aliases: ['ctx'],
    parent: createRoot,
    description: 'Create a context',
    webDocs: {
        category: 'Contexts',
        title: 'Create Context',
    },
    builder: (yargs) => {
        return yargs;
    },
    handler: async (argv) => {
        yargs.showHelp();
    },
});

module.exports = command;

