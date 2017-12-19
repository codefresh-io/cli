const debug           = require('debug')('codefresh:cli:create:context');
const CFError         = require('cf-errors');
const _               = require('lodash');
const { wrapHandler, printError } = require('../../../helper');
const { context }     = require('../../../../../logic').api;
const Table           = require('cli-table');
const { specifyOutputForSingle , specifyOutputForArray } = require('../helper');

const command = 'contexts [name]';
//maybe we dont need to give an option to type and owner? (according to kubectl)
const builder = (yargs) => {
    return yargs
        .positional('name', {
            describe: 'context name',
        })
        .option('type', {
            describe: 'Specific type of context',
            choices: ['config', 'secret'],
        })
        .option('owner', {
            describe: 'Owner of the context',
            choices: ['user', 'account'],
        });
};

const handler = async (argv) => {
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
};

module.exports = {
    command,
    builder,
    handler: wrapHandler(handler),
};
