const Command = require('../../Command');
const _ = require('lodash');
const { section: sectionLogic, board: boardLogic } = require('../../../../logic').api;

const applyRoot = require('../root/apply.cmd');


const command = new Command({
    command: 'section [id]',
    aliases: [],
    parent: applyRoot,
    description: 'Update a section',
    webDocs: {
        category: 'Section',
        title: 'Update Section',
    },
    builder: (yargs) => {
        yargs
            .positional('id', {
                describe: 'Id of existing section',
            })
            .option('boardId', {
                describe: 'Id of existing board',
            })
            .option('boardName', {
                describe: 'Name of existing board',
            })
            .option('name', {
                describe: 'Name of existing section',
            })
            .option('newName', {
                describe: 'New name',
            })
            .option('cluster', {
                describe: 'Link to cluster',
            })
            .option('color', {
                describe: 'New color',
            })
            .option('index', {
                describe: 'New index',
            })
            .example(
                'codefresh patch section ID --new-name NEW_NAME --filter /app-*/gi',
                'Update name and filter of section. Specifying section by ID',
            )
            .example(
                'codefresh patch section --name OLD_NAME --new-name NEW_NAME --filter /app-*/gi',
                'Update name and filter of section. Specifying section by NAME',
            );

        return yargs;
    },
    handler: async (argv) => {
        let { id, boardId } = argv;

        if (!argv.boardId) {
            if (!argv.boardName) throw Error('Nor board-id nor board-name was specified');

            const boardObj = await boardLogic.getBoardByName(argv.boardName);
            boardId = boardObj.id;
        }

        const data = _.merge({}, {
            boardId,
            section: argv.cluster,
            color: argv.color,
            index: argv.index,
            name: argv.newName,
        });

        if (!id) {
            if (!argv.name) throw Error('Nor section-id nor section-name was specified');

            const sectionObj = await sectionLogic.getSectionByName({ boardId, name: argv.name });
            id = sectionObj.id;
        }


        await sectionLogic.updateSection(id, data);
        console.log(`Section: "${argv.name}" patched.`);
    },
});

module.exports = command;
