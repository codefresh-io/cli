const debug = require('debug')('codefresh:cli:create:context');
const Command = require('../../Command');
const CFError = require('cf-errors');
const _ = require('lodash');
const { printError } = require('../../helpers/general');
const { context } = require('../../../../logic').api;
const { specifyOutputForSingle, specifyOutputForArray } = require('../../helpers/get');


const command = new Command({
    command: 'contexts [name]',
    description: 'get-contexts',
    builder: (yargs) => {
        return yargs
            .positional('name', {
                describe: 'context name',
            })
            .option('type', {
                describe: 'Specific type of context',
                choices: ['config', 'secret', 'helm-repository'],
            })
            .option('owner', {
                describe: 'Owner of the context',
                choices: ['user', 'account'],
            });
    },
    handler: async (argv) => {
        //maybe we dont need to give an option to type and owner? (according to kubectl)
        const data = {};
        if (argv.type) {
            data.type = argv.type;
        }
        if (argv.owner) {
            data.owner = argv.owner;
        }

        if (argv.name) {
            try {
                const singleContext = await context.getContextByName(argv.name, data.owner);
                specifyOutputForSingle(argv.output, singleContext);
            }
            catch (err) {
                const error = new CFError({
                    cause: err,
                    message: `get context ${argv.name} failed.`,
                });
                printError(error);
            }
        }
        else {
            try {
                const contextArray = await context.getContexts(data);
                specifyOutputForArray(argv.output, contextArray);
            }
            catch (err) {
                const error = new CFError({
                    cause: err,
                    message: 'get contexts failed',
                });
                printError(error);
            }
        }
    },
});

module.exports = command;
