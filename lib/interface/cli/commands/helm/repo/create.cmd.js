const debug = require('debug')('codefresh:cli:create:context');
const Command = require('../../../Command');
const CFError = require('cf-errors');
const _ = require('lodash');
const { helm } = require('../../../../../logic').api;
const createRoot = require('../../root/create.cmd');

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
                describe: 'Name of context',
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
        const data = {
            name: argv.name,
            public: argv.public,
        };

        await helm.createRepo(data);
        console.log(`Helm repo: ${data.name} created`);
    },
});

module.exports = command;

