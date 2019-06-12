const Command = require('../../Command');
const deleteRoot = require('../root/delete.cmd');
const { sdk } = require('../../../../logic');


const command = new Command({
    command: 'step [name]',
    parent: deleteRoot,
    description: 'Delete a step',
    webDocs: {
        category: 'Steps',
        title: 'Delete Step',
    },
    builder: (yargs) => {
        return yargs
            .positional('name', {
                describe: 'Step name',
            });
    },
    handler: async (argv) => {
        const { name } = argv;

        await sdk.steps.delete({ name });
        console.log(`Step '${name}' deleted.`);
    },
});


module.exports = command;

