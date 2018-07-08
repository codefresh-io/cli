const debug = require('debug')('codefresh:cli:create:context');
const Command = require('../../Command');
const CFError = require('cf-errors');
const _ = require('lodash');
const { context } = require('../../../../logic').api;
const deleteRoot = require('../root/delete.cmd');

const command = new Command({
    command: 'context [name]',
    aliases: ['ctx'],
    parent: deleteRoot,
    description: 'Delete a context',
    webDocs: {
        category: 'Contexts',
        title: 'Delete Context',
    },
    builder: (yargs) => {
        return yargs
            .positional('name', {
                describe: 'Name of context',
            })
            .example('codefresh delete context NAME', 'Delete context NAME');
    },
    handler: async (argv) => {
        const name = argv.filename ? _.get(argv.filename, 'metadata.name') : argv.name;

        if (!name) {
            throw new CFError('Name must be provided');
        }

        await context.deleteContextByName(name);
        console.log(`Context: ${name} deleted`);
    },
});

module.exports = command;

