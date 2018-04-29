const debug = require('debug')('codefresh:cli:create:pipelines2');
const Command = require('../../../Command');
const CFError = require('cf-errors');
const _ = require('lodash');
const { helm } = require('../../../../../logic').api;
const { printError } = require('../../../helpers/general');
const { specifyOutputForArray } = require('../../../helpers/get');

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
                describe: 'Name of context',
            })
            .option('public', {
                describe: 'Mark the helm repo as public',
                alias: 'p',
                type: 'boolean',
                default: false,
            })
            .example('codefresh patch helm-repo my-repo -p', 'Update helm repo to be public')
            .example('codefresh patch helm-repo my-repo -p=false', 'Update helm repo to be private');

        return yargs;
    },
    handler: async (argv) => {
        const data = {
            name: argv.name,
            public: argv.public,
        };

        await helm.updateRepo(data.name, data);
        console.log(`Helm repo: ${data.name} patched.`);
    },
});

module.exports = command;

