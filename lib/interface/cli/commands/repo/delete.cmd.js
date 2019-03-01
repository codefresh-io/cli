const Command = require('../../Command');
const deleteRoot = require('../root/delete.cmd');
const { sdk } = require('../../../../logic');

const command = new Command({
    command: 'repository [name_id]',
    aliases: ['repo'],
    parent: deleteRoot,
    description: 'Remove repository by name_id',
    webDocs: {
        category: 'Repository',
        title: 'Delete Repository',
        description: 'Remove repository by name_id ("name_id" can be retrieved with "get" command, typically "repo_owner/repo_name")',
        weight: 30,
    },
    builder: (yargs) => {
        yargs
            .positional('name_id', {
                describe: 'Repository "name_id" (can be retrieved with "get" command, typically "repo_owner/repo_name")',
                required: true,
            })
            .option('context', {
                describe: 'Name of the git context to use, if not passed the default will be used',
                alias: 'c',
            })
            .example('codefresh delete repo codefresh-io/some-repo', 'Delete codefresh repo with name_id "codefresh-io/some-repo"');
        return yargs;
    },
    handler: async (argv) => {
        const { name_id: name, context } = argv;

        if (!name) {
            console.log('Repository name_id not provided');
            return;
        }

        await sdk.repos.delete({ name, context });
        console.log(`Successfully deleted repo: ${name}`);
    },
});

module.exports = command;

