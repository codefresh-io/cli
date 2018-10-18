const Command = require('../../Command');
const { section: sectionLogic, board: boardLogic } = require('../../../../logic').api;
const createRoot = require('../root/create.cmd');


const command = new Command({
    command: 'section <name>',
    parent: createRoot,
    description: 'Create a section',
    usage: 'You can create a section specifying name unique for account.',
    webDocs: {
        category: 'Sections',
        title: 'Create section',
    },
    builder: (yargs) => {
        return yargs
            .positional('name', {
                describe: 'Name of section',
            })
            .option('board-id', {
                describe: 'Id of board where section is creating',
            })
            .option('board-name', {
                describe: 'Name of board where section is creating',
            })
            .option('cluster', {
                describe: 'Name of linked cluster',
            })
            .option('color', {
                describe: 'Color of section',
            })
            .option('index', {
                describe: 'Index of section',
            })
            .example(
                'codefresh create section NAME --board-name BOARD_NAME --cluster CLUSTER_NAME --color "#00AACC" --index 1',
                'Creating a section with board name',
            )
            .example(
                'codefresh create section NAME --board-id ID --cluster CLUSTER_NAME --color "#00AACC" --index 1',
                'Creating a section with board id',
            );
    },
    handler: async (argv) => {
        const reqBody = {
            name: argv.name,
            boardId: argv.boardId,
            section: argv.cluster,
            color: argv.color,
            index: argv.index,
        };

        if (!reqBody.boardId) {
            if (!argv.boardName) throw Error('Nor board-id nor board-name was specified');

            const boardObj = await boardLogic.getBoardByName(argv.boardName);
            reqBody.boardId = boardObj.id;
        }

        await sectionLogic.createSection(reqBody);
        console.log(`Section: "${reqBody.name}" created`);
    },
});


module.exports = command;
