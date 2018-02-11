const debug = require('debug')('codefresh:cli:create:pipelines2');
const Command = require('../../Command');
const CFError = require('cf-errors');
const _ = require('lodash');
const { prepareKeyValueFromCLIEnvOption } = require('../../helpers/general');
const { pipeline2 } = require('../../../../logic').api;
const replaceRoot = require('../root/replace.cmd');

const command = new Command({
    command: 'pipeline [name]',
    aliases: ['pip'],
    parent: replaceRoot,
    description: 'Replace a pipeline',
    webDocs: {
        category: 'Pipelines',
        title: 'Replace Pipeline',
    },
    builder: (yargs) => {
        return yargs
            .positional('name', {
                describe: 'Name of context',
            });
    },
    handler: async (argv) => {
        const {filename, name} = argv;

        if (!filename) {
            throw new CFError('Pipeline definitions file must be provided');
        }

        if (!_.get(filename, 'metadata.name') && !name) {
            throw new CFError('Name must be provided');
        }

        const data = argv.filename;
        if (name) {
            _.set(data, 'metadata.name', name);
        };

        await pipeline2.replaceByName(data.metadata.name, data);
        console.log(`Pipeline '${data.metadata.name}' updated`);
    },
});

module.exports = command;

