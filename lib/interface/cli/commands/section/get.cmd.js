const debug = require('debug')('codefresh:cli:create:pipelines2');
const Command = require('../../Command');
const CFError = require('cf-errors');
const Output = require('../../../../output/Output');
const getRoot = require('../root/get.cmd');
const { sdk } = require('../../../../logic');
const Section = require('../../../../logic/entities/Section');


const command = new Command({
    command: 'sections [id]',
    aliases: ['section'],
    parent: getRoot,
    description: 'Get a specific section or an array of sections',
    webDocs: {
        category: 'Sections',
        title: 'Get Section',
    },
    builder: (yargs) => {
        return yargs
            .option('board-id', {
                describe: 'Board id',
            })
            .option('board-name', {
                describe: 'Board name',
            })
            .positional('id', {
                describe: 'Section by id',
            })
            .option('name', {
                describe: 'Section by name',
            });
    },
    handler: async (argv) => {
        const { id, name, boardName } = argv;
        let { boardId } = argv;
        if (id) {
            try {
                const section = await sdk.helm.sections.get({ id });
                Output.print(Section.fromResponse(section));
            } catch (err) {
                debug(err.toString());
                const message = `Section '${id}' was not found`;
                throw new CFError({
                    cause: err,
                    message,
                });
            }
        } else {
            if (!boardId) {
                if (!boardName) throw Error('Neither board-id nor board-name was specified');

                const boardObj = await sdk.helm.boards.getByName({ name: boardName });
                boardId = boardObj._id;
            }

            if (name) {
                try {
                    const section = await sdk.helm.sections.getByName({ boardId, name });
                    Output.print(Section.fromResponse(section));
                } catch (err) {
                    debug(err.toString());
                    const message = `Section '${name}' was not found`;
                    throw new CFError({
                        cause: err,
                        message,
                    });
                }
            } else {
                const sections = await sdk.helm.sections.getAll({ boardId });
                Output.print(sections.map(Section.fromResponse));
            }
        }
    },
});

module.exports = command;

