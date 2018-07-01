const debug = require('debug')('codefresh:cli:create:pipelines2');
const Command = require('../../Command');
const _ = require('lodash');
const { runtimeEnvironments } = require('../../../../logic/index').api;
const { specifyOutputForSingle } = require('../../helpers/get');


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
            /*
            .option('account', {
                describe: 'Return a specific account configuration by the given name from the current runtime environments',
            })
            */
            .option('history', {
                describe: 'Return all the history of the specific runtime environments',
                type: 'boolean',
            });
    },
    handler: async (argv) => {
        const { name, version, history, account } = argv;
        if (history){
            const allHistory = await runtimeEnvironments.getRuntimeEvironmentsHistory({
                name,
            });
            console.log(JSON.stringify(allHistory, null, '\t'));

        }
        else {
            const currruntimeEnvironments = await runtimeEnvironments.getRuntimeEvironmentsByName({
                name,
                version,
            });
            specifyOutputForSingle(argv.output, currruntimeEnvironments);
        }
    },
});

module.exports = command;

