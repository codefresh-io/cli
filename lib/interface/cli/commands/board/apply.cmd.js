const debug = require('debug')('codefresh:cli:create:pipelines2');
const Command = require('../../Command');
const CFError = require('cf-errors');
const _ = require('lodash');
const { board: boardLogic } = require('../../../../logic').api;
const { printError } = require('../../helpers/general');
const { specifyOutputForArray } = require('../../helpers/get');

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
        let { id } = argv;

        const data = {
            name: argv.newName,
            filter: argv.filter,
        };

        if (!id) {
            if (!argv.name) throw Error('Nor board-id nor board-name was specified');

            const boardObj = await boardLogic.getBoardByName(argv.name);
            id = boardObj.id;
        }


        await boardLogic.updateBoard(id, data);
        console.log(`Board: "${data.name}" patched.`);
    },
});

module.exports = command;

