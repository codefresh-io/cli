const debug = require('debug')('codefresh:cli:replace:context');
const Command = require('../../Command');
const CFError = require('cf-errors');
const _ = require('lodash');
const { context } = require('../../../../logic').api;

const command = new Command({
    command: 'context',
    description: 'Replace a context resource',
    builder: (yargs) => {
        return yargs;
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

