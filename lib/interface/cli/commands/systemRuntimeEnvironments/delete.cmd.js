const Command = require('../../Command');
const deleteRoot = require('../root/delete.cmd');
const sysRe = require('../../helpers/sys-re');


const command = new Command({
    command: 'system-runtime-environments [name]',
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
            await sysRe.delete({ name, plan, force });
            console.log(`Runtime-Environment '${name}' deleted.`);
        } catch (error) {
            console.log(`Cannot delete Runtime-Environment: ${name}`);
            throw error;
        }


    },
});


module.exports = command;

