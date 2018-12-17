const Command = require('../../Command');
const { repository } = require('../../../../logic').api;
const deleteRoot = require('../root/delete.cmd');

const command = new Command({
    command: 'repository [name_id]',
    aliases: ['repo'],
    parent: deleteRoot,
    description: 'Remove repository by name_id',
    webDocs: {
        category: 'Repository',
        title: 'Delete Repository',
    },
    builder: (yargs) => {
        yargs
            .positional('name_id', {
                describe: 'Repository "name_id" (can be retrieved with "get" command)',
                required: true,
            })
            .option('context', {
                describe: 'Name of the git context to use, if not passed the default will be used',
                alias: 'c',
            });
        return yargs;
    },
    handler: async (argv) => {
        const { name_id: name, context } = argv;

        if (!name) {
            console.log('Repository name_id not provided');
            return;
        }

        try {
            await repository.deleteRepo(name, context);
            console.log(`Successfully deleted repo: ${name}`);
        } catch (e) {
            console.log('Failed to delete repo:');
            console.log(`  - ${e.message}`);
        }
    },
});

module.exports = command;

