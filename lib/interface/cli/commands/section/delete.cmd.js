const Command = require('../../Command');
const { board, section } = require('../../../../logic').api;
const deleteRoot = require('../root/delete.cmd');


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
            .positional('boardId', {
                describe: 'board Id',
            })
            .positional('boardName', {
                describe: 'board name',
            })
            .positional('name', {
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
            if (!name) throw Error('Nor section-id nor section-name was specified');

            // get board id
            if (!boardId) {
                if (!boardName) throw Error('Nor board-id nor board-name was specified');

                const boardObj = await board.getBoardByName(boardName);
                boardId = boardObj.id;
            }


            const sectionObj = await section.getSectionByName({ boardId, name });
            id = sectionObj.id;
        }

        await section.deleteSection(id);
        console.log(`Section '${name || id}' deleted.`);
    },
});


module.exports = command;

