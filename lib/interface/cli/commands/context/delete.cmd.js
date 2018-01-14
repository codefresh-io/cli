const debug = require('debug')('codefresh:cli:create:context');
const Command = require('../../Command');
const CFError = require('cf-errors');
const _ = require('lodash');
const { context } = require('../../../../logic').api;
const deleteRoot = require('../root/delete.cmd');

const command = new Command({
    command: 'context [name]',
    aliases: ['ctx'],
    description: 'Delete a context',
    category: 'Contexts',
    parent: deleteRoot,
    builder: (yargs) => {
        return yargs
            .positional('name', {
                describe: 'Name of context',
            });
    },
    handler: async (argv) => {
        const name = argv.filename ? _.get(argv.filename, 'metadata.name') : argv.name;
        const owner = argv.filename ? _.get(argv.filename, 'owner') : argv.owner;

        if (!name) {
            throw new CFError('Name must be provided');
        }

        await context.deleteContextByName(name, owner);
        console.log(`Context: ${name} deleted`);
    },
});

module.exports = command;

