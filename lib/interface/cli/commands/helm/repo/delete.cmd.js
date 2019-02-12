const Command = require('../../../Command');
const deleteRoot = require('../../root/delete.cmd');
const { sdk } = require('../../../../../logic');


const command = new Command({
    command: 'helm-repo [name]',
    aliases: [],
    parent: deleteRoot,
    description: 'Delete a helm repo',
    webDocs: {
        category: 'Helm Repos',
        title: 'Delete Helm Repo',
    },
    builder: (yargs) => {
        return yargs
            .positional('name', {
                describe: 'Helm repo name',
                required: true,
            })
            .example('codefresh delete helm-repo my-repo', 'Delete a helm repo.');
    },
    handler: async (argv) => {
        const { name } = argv;

        if (!name) {
            throw new Error('Repo name must be provided');
        }

        await sdk.helm.repos.delete({ name });
        console.log(`Helm repo '${name}' deleted.`);
    },
});


module.exports = command;

