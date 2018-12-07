const debug = require('debug')('codefresh:cli:create:pipelines2');
const Command = require('../../../Command');
const CFError = require('cf-errors');
const _ = require('lodash');
const { helm } = require('../../../../../logic').api;
const { printError } = require('../../../helpers/general');
const { specifyOutputForArray } = require('../../../helpers/get');

const getRoot = require('../../root/get.cmd');


const command = new Command({
    command: 'helm-repo [name..]',
    aliases: [],
    parent: getRoot,
    description: 'Get a specific helm-repo or an array of helm-repos',
    webDocs: {
        category: 'Helm Repos',
        title: 'Get Helm Repo',
    },
    builder: (yargs) => {
        yargs
            .positional('name', {
                describe: 'Helm repo name',
            })
            .example('codefresh get helm-repo', 'Get all helm repos')
            .example('codefresh get helm-repo my-repo', 'Get a specific helm repo');
        return yargs;
    },
    handler: async (argv) => {
        const { name: names, output } = argv;

        if (!_.isEmpty(names)) {
            const repos = [];
            for (const name of names) {
                try {
                    const currRepo = await helm.getRepoByName(name);
                    repos.push(currRepo);
                } catch (err) {
                    if (repos.length) {
                        specifyOutputForArray(output, repos, argv.pretty);
                    }

                    debug(err.toString());
                    const message = err.toString().includes('not find') ? `Helm repo '${name}' was not found.` : 'Error occurred';
                    throw new CFError({
                        cause: err,
                        message,
                    });
                }
            }
            specifyOutputForArray(output, repos, argv.pretty);
        } else {
            specifyOutputForArray(output, await helm.getAllRepos(), argv.pretty);
        }
    },
});

module.exports = command;

