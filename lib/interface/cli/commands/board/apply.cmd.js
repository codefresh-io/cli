const Command = require('../../Command');
const { sdk } = require('../../../../logic');

const applyRoot = require('../root/apply.cmd');

const command = new Command({
    command: 'board [id]',
    aliases: [],
    parent: applyRoot,
    description: 'Update a board',
    webDocs: {
        category: 'Board',
        title: 'Update Board',
    },
    builder: (yargs) => {
        yargs
            .positional('id', {
                describe: 'Id of existing board',
            })
            .option('name', {
                describe: 'Name of existing board',
            })
            .option('newName', {
                describe: 'New name',
            })
            .option('filter', {
                describe: 'New filter',
            })
            .example(
                'codefresh patch board ID --new-name NEW_NAME --filter /app-*/gi',
                'Update name and filter of board. Specifying board by ID',
            )
            .example(
                'codefresh patch board --name OLD_NAME --new-name NEW_NAME --filter /app-*/gi',
                'Update name and filter of board. Specifying board by NAME',
            );

        return yargs;
    },
    handler: async (argv) => {
        let { id, name } = argv;

        const data = {
            name: argv.newName,
            filter: argv.filter,
        };

        if (!id) {
            if (!argv.name) throw Error('Neither board-id nor board-name were specified');

            const boardObj = await sdk.helm.boards.getByName({ name: argv.name });
            id = boardObj._id;
        }


        await sdk.helm.boards.patch({ id }, data);
        console.log(`Board: "${name || id}" patched.`);
    },
});

module.exports = command;
