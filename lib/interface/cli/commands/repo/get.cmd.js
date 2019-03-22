const Command = require('../../Command');
const getRoot = require('../root/get.cmd');

const DEPRECATION_MESSAGE = 'Repositories are no more used at Codefresh. Please use projects.';

const command = new Command({
    command: 'repository [names..]',
    aliases: ['repo'],
    parent: getRoot,
    description: DEPRECATION_MESSAGE,
    webDocs: {
        category: 'Repository',
        title: 'Get Repositories',
        weight: 20,
    },
    handler: async () => {
        console.log(`${DEPRECATION_MESSAGE}`);
        process.exit(1);
    },
});

module.exports = command;

