const debug = require('debug')('codefresh:cli:create:pipelines2');
const Command = require('../../../Command');
const CFError = require('cf-errors');
const _ = require('lodash');
const { helm } = require('../../../../../logic').api;
const deleteRoot = require('../../root/delete.cmd');


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
        yargs
            .positional('name', {
                describe: 'Helm repo name',
            })
            .example('codefresh delete helm-repo my-repo', 'Delete a helm repo.');
        return yargs;
    },
    handler: async (argv) => {
        const { name } = argv;

        await helm.deleteRepo(name);
        console.log(`Helm repo '${name}' deleted.`);
    },
});


module.exports = command;

