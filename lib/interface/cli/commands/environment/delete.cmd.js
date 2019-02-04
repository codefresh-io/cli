const Command = require('../../Command');
const deleteRoot = require('../root/delete.cmd');
const { sdk } = require('../../../../logic');

const command = new Command({
    command: 'environment <id>',
    aliases: ['env'],
    description: 'Delete an environment',
    parent: deleteRoot,
    webDocs: {
        category: 'Environments',
        title: 'Delete Environment',
    },
    builder: (yargs) => {
        return yargs
            .positional('id', {
                describe: 'Environment id',
            })
            .example('codefresh delete environment ID', 'Delete environment ID');
    },
    handler: async (argv) => {
        const id = argv.id;
        await sdk.envs.terminate({ id });
        console.log(`Environment: ${id} deleted`);
    },
});

module.exports = command;
