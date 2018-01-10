const debug = require('debug')('codefresh:cli:create:pipelines2');
const Command = require('../../Command');
const CFError = require('cf-errors');
const _ = require('lodash');
const { prepareKeyValueFromCLIEnvOption } = require('../../helpers/general');
const { pipeline2 } = require('../../../../logic').api;
const replaceRoot = require('../root/replace.cmd');

const command = new Command({
    betaCommand: true,
    command: 'pipeline2 [name]',
    description: 'Replaces a pipeline',
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

        if (!filename.name && !name) {
            throw new CFError('Name must be provided');
        }

        const data = argv.filename;
        if (name) {
            data.name = name;
        };

        await pipeline2.replaceByName(data.name, data);
        console.log(`Pipeline '${data.name}' updated`);
    },
});

replaceRoot.subCommand(command);


module.exports = command;

