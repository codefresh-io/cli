const Command = require('../../Command');
const createRoot = require('../root/create.cmd');
const yargs = require('yargs');

const command = new Command({
    command: 'registry',
    category: 'Registries',
    parent: createRoot,
    description: 'Integrate Container registry into Codefresh',
    webDocs: {
        category: 'Registries',
        title: 'Create Registry',
    },
    handler: async () => {
        yargs.showHelp();
    },
});

module.exports = command;

