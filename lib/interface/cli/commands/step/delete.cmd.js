const Command = require('../../Command');
const deleteRoot = require('../root/delete.cmd');
const { sdk } = require('../../../../logic');


const command = new Command({
    command: 'step-type [name]',
    parent: deleteRoot,
    description: 'Delete a step-type',
    webDocs: {
        category: 'Step-types',
        title: 'Delete Step-type',
    },
    builder: (yargs) => {
        return yargs
            .positional('name', {
                describe: 'Step-type name',
            });
    },
    handler: async (argv) => {
        const { name } = argv;

        await sdk.steps.delete({ name });
        console.log(`Step-type '${name}' deleted.`);
    },
});


module.exports = command;

