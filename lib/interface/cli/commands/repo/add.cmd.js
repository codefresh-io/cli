const Command = require('../../Command');
const addRoot = require('../root/add.cmd');

const DEPRECATION_MESSAGE = 'Repositories are no more used at Codefresh. Please use projects.';

const command = new Command({
    command: 'repository [fullname]',
    aliases: ['repo'],
    parent: addRoot,
    description: DEPRECATION_MESSAGE,
    webDocs: {
        category: 'Repository',
        title: 'Add Repository',
        weight: 10,
    },
    handler: async () => {
        console.log(`${DEPRECATION_MESSAGE}`);
        process.exit(1);
    },
});

module.exports = command;

