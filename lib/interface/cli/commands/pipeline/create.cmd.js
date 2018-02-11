const debug = require('debug')('codefresh:cli:create:pipelines2');
const Command = require('../../Command');
const CFError = require('cf-errors');
const _ = require('lodash');
const { prepareKeyValueFromCLIEnvOption } = require('../../helpers/general');
const { pipeline } = require('../../../../logic').api;
const createRoot = require('../root/create.cmd');

const command = new Command({
    command: 'pipeline [name]',
    aliases: ['pip'],
    parent: createRoot,
    description: 'Create a pipeline',
    webDocs: {
        category: 'Pipelines',
        title: 'Create Pipeline',
    },
    builder: (yargs) => {
        return yargs
            .positional('name', {
                describe: 'Name of context',
            });
    },
    handler: async (argv) => {
        throw new CFError('Not implemented');
    },
});


module.exports = command;

