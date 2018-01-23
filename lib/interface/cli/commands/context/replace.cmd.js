const debug = require('debug')('codefresh:cli:replace:context');
const Command = require('../../Command');
const CFError = require('cf-errors');
const _ = require('lodash');
const { context } = require('../../../../logic').api;
const replaceRoot = require('../root/replace.cmd');

const command = new Command({
    command: 'context',
    aliases: ['ctx'],
    parent: replaceRoot,
    description: 'Replace a context',
    webDocs: {
        category: 'Contexts',
        title: 'Replace a context',
    },
    builder: (yargs) => {
        return yargs
            .example('codefresh replace context -f ./context.yml', 'Replace a context that matches name field of context.yml content');
    },
    handler: async (argv) => {
        const data = argv.filename;
        const name = _.get(data, 'metadata.name');

        if (!name) {
            throw new CFError('Missing name in metadata');
        }

        await context.replaceByName(name, data);

        console.log(`Context: ${name} replaced`);
    },
});


module.exports = command;

