const debug                                            = require('debug')('codefresh:cli:create:context');
const CFError                                          = require('cf-errors');
const _                                                = require('lodash');
const { wrapHandler, prepareKeyValueFromCLIEnvOption } = require('../../../helper');
const { context }                                      = require('../../../../../logic').api;

const command = 'context [type] [name]';

const describe = 'Create a context';

const builder = (yargs) => {
    return yargs
        .positional('name', {
            describe: 'Name of context',
        })
        .positional('type', {
            describe: 'Type of the context',
            choices: ['config', 'secret'],
        })
        .option('owner', {
            describe: 'Owner of the context',
            choices: ['user', 'account'],
            default: 'account',
        })
        .option('variable', {
            describe: 'Variables list',
            default: [],
            alias: 'v',
        });

};

const handler = async (argv) => {
    let data;

    if (argv.filename) {
        data = argv.filename;
    } else {
        data = {
            name: argv.name,
            type: argv.type,
            owner: argv.owner,
            data: prepareKeyValueFromCLIEnvOption(argv.variable),
        };

        if (!data.name || !data.type) {
            throw new CFError('Name and type must be provided');
        }
    }

    await context.createContext(data);
    console.log(`Context: ${data.name} created`);
};

module.exports = {
    command,
    describe,
    builder,
    handler: wrapHandler(handler),
};
