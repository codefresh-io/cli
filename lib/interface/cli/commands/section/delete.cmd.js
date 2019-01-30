const Command = require('../../Command');
const deleteRoot = require('../root/delete.cmd');
const { sdk } = require('../../../../logic');


const command = new Command({
    command: 'section [id]',
    aliases: [],
    parent: deleteRoot,
    description: 'Delete a section',
    webDocs: {
        category: 'Section',
        title: 'Delete section',
    },
    builder: (yargs) => {
        yargs
            .positional('id', {
                describe: 'section id',
            })
            .option('boardId', {
                describe: 'board Id',
            })
            .option('boardName', {
                describe: 'board name',
            })
            .option('name', {
                describe: 'section name',
            })
            .example('codefresh delete section --board-name BOARD --name NAME', 'Delete section by board name and section name.')
            .example('codefresh delete section SECTION_ID', 'Delete section by id.');
        return yargs;
    },
    handler: async (argv) => {
        const { name, boardName } = argv;
        let { id, boardId } = argv;

        // get section id
        if (!id) {
            if (!name) throw Error('Neither section-id nor section-name was specified');

            // get board id
            if (!boardId) {
                if (!boardName) throw Error('Neither board-id nor board-name was specified');

                const boardObj = await sdk.helm.boards.getByName({ name: boardName });
                boardId = boardObj._id;
            }


            const sectionObj = await sdk.helm.sections.getByName({ boardId, name });
            id = sectionObj._id;
        }

        await sdk.helm.sections.delete({ id });
        console.log(`Section '${name || id}' deleted.`);
    },
});


module.exports = command;

