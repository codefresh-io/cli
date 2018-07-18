const debug = require('debug')('codefresh:cli:create:pipelines2');
const Command = require('../../Command');
const CFError = require('cf-errors');
const _ = require('lodash');
const { runtimeEnvironments } = require('../../../../logic/index').api;
const deleteRoot = require('../root/delete.cmd');


const command = new Command({
    command: 'runtime-environments name',
    aliases: ['re', 'runtime-environment'],
    parent: deleteRoot,
    description: 'Delete a runtime-environment',
    webDocs: {
        category: 'Runtime-Environments (On Prem)',
        title: 'Delete Runtime-Environments',
    },
    builder: (yargs) => {
        return yargs
            .positional('name', {
                describe: 'Runtime environment name',
            });
    },
    handler: async (argv) => {
        const { name } = argv;

        await runtimeEnvironments.deleteRuntimeEnvironmentByName(name);
        console.log(`Runtime-Environment '${name}' deleted.`);
    },
});


module.exports = command;

