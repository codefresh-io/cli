const Command = require('../../../Command');
const createRoot = require('../../root/create.cmd');
const { sdk } = require('../../../../../logic');

const command = new Command({
    command: 'helm-repo [name]',
    parent: createRoot,
    description: 'Create a Codefresh managed helm repo',
    usage: 'ATM it is only possible to create a helm repository against Codefresh managed helm registry',
    webDocs: {
        category: 'Helm Repos',
        title: 'Create Helm Repo',
    },
    builder: (yargs) => {
        yargs
            .positional('name', {
                describe: 'Name of repo',
                required: true,
            })
            .option('public', {
                describe: 'Mark the helm repo as public',
                alias: 'p',
                type: 'boolean',
                default: false,
            })
            .example('codefresh create helm-repo', 'Create a private helm repo managed by Codefresh.')
            .example('codefresh create helm-repo --public', 'Create a public helm repo managed by Codefresh.');

        return yargs;
    },
    handler: async (argv) => {
        if (!argv.name) {
            throw new Error('Repo name must be provided');
        }

        const data = {
            name: argv.name,
            public: argv.public,
        };

        await sdk.helm.repos.create(data);
        console.log(`Helm repo: ${data.name} created`);
    },
});

module.exports = command;

