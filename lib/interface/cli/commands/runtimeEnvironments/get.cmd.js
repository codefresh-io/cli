const debug = require('debug')('codefresh:cli:create:pipelines2');
const Command = require('../../Command');
const _ = require('lodash');
const { runtimeEnvironments } = require('../../../../logic/index').api;

const getRoot = require('../root/get.cmd');


const command = new Command({
    command: 'runtime-environments [name] [version]',
    aliases: ['re', 'runtime-environment'],
    parent: getRoot,
    description: 'Get a runtime environments configuration',
    onPremCommand: true,
    webDocs: {
        category: 'Runtime-Environments (On Prem)',
        title: 'Get Runtime-Environments',
    },
    builder: (yargs) => {
        return yargs
            .positional('name', {
                describe: 'Runtime environments name',
                default: 'default',
            })
            .positional('version', {
                describe: 'Runtime environments version',
            })
            .option('account', {
                describe: 'Return a specific account configuration from the current runtime environments by his name',
            })
            .option('history', {
                describe: 'Return all the history of the specific runtime environments',
                type: 'boolean',
            });
    },
    handler: async (argv) => {
        const { name, version, history } = argv;
        const runtimeEnv = argv['runtime-environment'];
        let currruntimeEnvironments;
        if (runtimeEnv) {
            currruntimeEnvironments = await runtimeEnvironments.getRuntimeEvironment(runtimeEnv);
        } else {
            currruntimeEnvironments = await runtimeEnvironments.getRuntimeEvironmentsByName({
                name,
                version,
                history,
            });
        }
        console.log(JSON.stringify(currruntimeEnvironments, null, '\t'));
    },
});

module.exports = command;

