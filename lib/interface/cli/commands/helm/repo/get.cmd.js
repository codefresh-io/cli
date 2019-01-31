const debug = require('debug')('codefresh:cli:create:pipelines2');
const Command = require('../../../Command');
const CFError = require('cf-errors');
const _ = require('lodash');
const Output = require('../../../../../output/Output');
const { sdk } = require('../../../../../logic');
const HelmRepo = require('../../../../../logic/entities/HelmRepo');

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
        const { name: names } = argv;

        let repos
        if (!_.isEmpty(names)) {
            repos = [];
            for (const name of names) {
                try {
                    const currRepo = await sdk.helm.repos.get({ name });
                    repos.push(currRepo);
                } catch (err) {
                    if (repos.length) {
                        Output.print(repos);
                    }

                    debug(err.toString());
                    const message = err.toString().includes('not find') ? `Helm repo '${name}' was not found.` : 'Error occurred';
                    throw new CFError({
                        cause: err,
                        message,
                    });
                }
            }
        } else {
            repos = await sdk.helm.repos.getAll();
        }
        Output.print(repos.map(HelmRepo.fromResponse));
    },
});

module.exports = command;

