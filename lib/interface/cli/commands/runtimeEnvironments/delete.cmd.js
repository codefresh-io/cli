const debug = require('debug')('codefresh:cli:create:pipelines2');
const Command = require('../../Command');
const CFError = require('cf-errors');
const _ = require('lodash');
const { runtimeEnvironments } = require('../../../../logic/index').api;
const deleteRoot = require('../root/delete.cmd');


const command = new Command({
    command: 'runtime-environments [name] [version]',
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
            })
            .positional('version', {
                describe: 'Runtime environment version',
            });
    },
    handler: async (argv) => {
        const { name, version } = argv;

        await runtimeEnvironments.deleteRuntimeEnvironmentByName(name, version);
        console.log(`Runtime-Environment '${name}' deleted.`);
    },
});


module.exports = command;

