const Command = require('../../Command');
const deleteRoot = require('../root/delete.cmd');

const DEPRECATION_MESSAGE = 'Repositories are no more used at Codefresh. Please use projects.';

const command = new Command({
    command: 'repository [name_id]',
    aliases: ['repo'],
    parent: deleteRoot,
    description: DEPRECATION_MESSAGE,
    webDocs: {
        category: 'Repository',
        title: 'Delete Repository',
        description: 'Remove repository by name_id ("name_id" can be retrieved with "get" command, typically "repo_owner/repo_name")',
        weight: 30,
    },
    handler: async () => {
        console.log(`${DEPRECATION_MESSAGE}`);
        process.exit(1);
    },
});

module.exports = command;

