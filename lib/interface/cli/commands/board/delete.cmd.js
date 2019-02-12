const Command = require('../../Command');
const { sdk } = require('../../../../logic');
const deleteRoot = require('../root/delete.cmd');

const command = new Command({
    command: 'board [id]',
    aliases: [],
    parent: deleteRoot,
    description: 'Delete a board',
    webDocs: {
        category: 'Board',
        title: 'Delete board',
    },
    builder: (yargs) => {
        yargs
            .positional('id', {
                describe: 'board id',
            })
            .positional('name', {
                describe: 'board name',
            })
            .example('codefresh delete board --name NAME', 'Delete board by name.')
            .example('codefresh delete board ID', 'Delete board by Id.');
        return yargs;
    },
    handler: async (argv) => {
        const { name } = argv;
        let { id } = argv;

        if (!id) {
            if (!name) throw Error('Neither board-id nor board-name was specified');

            const boardObj = await sdk.helm.boards.getByName({ name });
            id = boardObj._id;
        }

        await sdk.helm.boards.delete({ id });
        console.log(`Board '${name || id}' deleted.`);
    },
});

module.exports = command;
