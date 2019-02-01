const debug = require('debug')('codefresh:cli:create:pipelines2');
const Command = require('../../Command');
const CFError = require('cf-errors');
const { sdk } = require('../../../../logic');
const Board = require('../../../../logic/entities/Board');
const Output = require('../../../../output/Output');

const getRoot = require('../root/get.cmd');

const command = new Command({
    command: 'boards [id..]',
    aliases: ['board'],
    parent: getRoot,
    description: 'Get a specific board or an array of boards',
    webDocs: {
        category: 'Boards',
        title: 'Get Board',
    },
    builder: (yargs) => {
        return yargs
            .option('id', {
                describe: 'Board by id',
            })
            .option('name', {
                describe: 'Board by name',
            });
    },
    handler: async (argv) => {
        const { id, name } = argv;
        if (id) {
            try {
                const board = await sdk.helm.boards.get({ id });
                Output.print(Board.fromResponse(board));
            } catch (err) {
                debug(err.toString());
                const message = `Board '${id}' was not found`;
                throw new CFError({
                    cause: err,
                    message,
                });
            }
        } else if (name) {
            try {
                const board = await sdk.helm.boards.getByName({ name });
                Output.print(Board.fromResponse(board));
            } catch (err) {
                debug(err.toString());
                const message = `Board '${name}' was not found`;
                throw new CFError({
                    cause: err,
                    message,
                });
            }
        } else {
            const boards = await sdk.helm.boards.getAll();
            Output.print(boards.map(Board.fromResponse));
        }
    },
});

module.exports = command;
