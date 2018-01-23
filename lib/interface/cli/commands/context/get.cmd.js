const debug = require('debug')('codefresh:cli:create:context');
const Command = require('../../Command');
const CFError = require('cf-errors');
const _ = require('lodash');
const { printError } = require('../../helpers/general');
const { context } = require('../../../../logic').api;
const { specifyOutputForSingle, specifyOutputForArray } = require('../../helpers/get');
const getRoot = require('../root/get.cmd');


const command = new Command({
    command: 'contexts [name]',
    aliases: ['ctx', 'context'],
    parent: getRoot,
    description: 'Get a specific context or an array of contexts',
    usage: 'Passing [name] argument will cause a retrieval of a specific context.\n In case of not passing [name] argument, a list will be returned',
    webDocs: {
        category: 'Contexts',
        title: 'Get a single context',
    },
    builder: (yargs) => {
        return yargs
            .positional('name', {
                describe: 'context name',
            })
            .option('type', {
                describe: 'Context type',
                choices: ['config', 'secret', 'helm-repository', 'yaml', 'secret-yaml'],
            })
            .option('owner', {
                describe: 'Owner of the context',
                choices: ['user', 'account'],
            })
            .example('codefresh get context NAME', 'Get context NAME')
            .example('codefresh get contexts', 'Get all contexts')
            .example('codefresh get context --type secret', 'Get all secret contexts')
            .example('codefresh get context --type helm-repository', 'Get all helm-repository contexts');
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
