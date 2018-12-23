const debug = require('debug')('codefresh:cli:create:pipelines2');
const Command = require('../../Command');
const CFError = require('cf-errors');
const _ = require('lodash');
const { runtimeEnvironments } = require('../../../../logic/index').api;
const deleteRoot = require('../root/delete.cmd');


const command = new Command({
    command: 'system-runtime-environments name',
    aliases: ['sys-re','system-runtime-environment'],
    parent: deleteRoot,
    description: 'Delete a runtime-environment',
    onPremCommand: true,
    webDocs: {
        title: 'Delete System Runtime-Environments',
    },
    builder: (yargs) => {
        return yargs
            .positional('name', {
                describe: 'Runtime environment name',
            })
            .option('plan', {
                describe: 'Runtime environment plan',
            })
            .option('force', {
                describe: 'Delete runtime environment in force mode',
                type: 'boolean',
            });
    },
    handler: async (argv) => {
        const { name, plan, force } = argv;

        try {
            await runtimeEnvironments.deleteRuntimeEnvironmentByNameForAdmin({ name, plan, force });
            console.log(`Runtime-Environment '${name}' deleted.`);
        } catch (error) {
            console.log(`Cannot delete Runtime-Environment: ${name}`);
        }


    },
});


module.exports = command;

