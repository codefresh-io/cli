const debug = require('debug')('codefresh:cli:create:pipelines2');
const Command = require('../../Command');
const { sdk } = require('../../../../logic');
const deleteRoot = require('../root/delete.cmd');


const command = new Command({
    command: 'runtime-environments name',
    aliases: ['re', 'runtime-environment'],
    parent: deleteRoot,
    description: 'Delete a runtime-environment',
    webDocs: {
        category: 'Runtime-Environments',
        title: 'Delete Runtime-Environments',
    },
    builder: (yargs) => {
        return yargs
            .positional('name', {
                describe: 'Runtime environment name',
            })
            .option('force', {
                describe: 'Delete runtime environment in force mode',
                type: 'boolean',
            });
    },
    handler: async (argv) => {
        const { name, force } = argv;
        await sdk.runtimeEnvs.delete({ name, force });
        console.log(`Runtime-Environment '${name}' deleted.`);
    },
});


module.exports = command;

