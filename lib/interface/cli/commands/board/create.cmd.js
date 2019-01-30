const Command = require('../../Command');
const { sdk } = require('../../../../logic');
const createRoot = require('../root/create.cmd');

const command = new Command({
    command: 'board <name>',
    parent: createRoot,
    description: 'Create a team',
    usage: 'You can create a board specifying name unique for account.',
    webDocs: {
        category: 'Boards',
        title: 'Create board',
    },
    builder: (yargs) => {
        return yargs
            .positional('name', {
                describe: 'Name of board',
            })
            .option('filter', {
                describe: 'Filter for clusters\' names',
            })
            .example('codefresh create board NAME', 'Creating a board')
            .example('codefresh create board NAME --filter /app-.*/gi', 'Creating a board with filter /app-.*/gi');
    },
    handler: async (argv) => {
        const reqBody = Object.assign({ name: argv.name }, argv.filter);

        await sdk.helm.boards.create(reqBody);
        console.log(`Board: "${reqBody.name}" created`);
    },
});

module.exports = command;
