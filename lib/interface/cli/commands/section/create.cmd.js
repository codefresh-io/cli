const Command = require('../../Command');
const createRoot = require('../root/create.cmd');
const { sdk } = require('../../../../logic');


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
                required: true,
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
                default: '#CCAA00',
            })
            .option('index', {
                describe: 'Index of section',
                default: '1',
            })
            .example(
                'codefresh create section NAME --board-name BOARD_NAME --cluster CLUSTER_NAME',
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
            if (!argv.boardName) throw Error('Neither board-id nor board-name was specified');

            const boardObj = await sdk.helm.boards.getByName({ name: argv.boardName });
            reqBody.boardId = boardObj._id;
        }

        await sdk.helm.sections.create(reqBody);
        console.log(`Section: "${reqBody.name}" created`);
    },
});


module.exports = command;
