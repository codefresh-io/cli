const Command = require('../../../Command');
const { sdk } = require('../../../../../logic');

const applyRoot = require('../../root/apply.cmd');


const command = new Command({
    command: 'helm-repo [name]',
    aliases: [],
    parent: applyRoot,
    description: 'Update a helm repo',
    webDocs: {
        category: 'Helm Repos',
        title: 'Update Helm Repo',
    },
    builder: (yargs) => {
        yargs
            .positional('name', {
                describe: 'Old repo name',
                required: true,
            })
            .option('public', {
                describe: 'Mark the helm repo as public',
                alias: 'p',
                type: 'boolean',
                default: undefined,
            })
            .option('newName', {
                describe: 'New repo name',
                alias: 'n',
                type: 'string',
            })
            .example('codefresh patch helm-repo my-repo -p', 'Update helm repo to be public')
            .example('codefresh patch helm-repo my-repo -p=false', 'Update helm repo to be private');

        return yargs;
    },
    handler: async (argv) => {
        if (!argv.name) {
            throw new Error('Repo name must be provided');
        }

        const data = {
            name: argv.newName,
            public: argv.public,
        };

        console.log(data)
        await sdk.helm.repos.update({ name: argv.name }, data);
        console.log(`Helm repo: ${argv.name} patched.`);
    },
});

module.exports = command;

