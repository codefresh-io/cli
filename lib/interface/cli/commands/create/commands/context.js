const debug                                            = require('debug')('codefresh:cli:create:context');
const CFError                                          = require('cf-errors');
const _                                                = require('lodash');
const { wrapHandler, prepareKeyValueFromCLIEnvOption } = require('../../../helper');
const { context }                                      = require('../../../../../logic').api;

const command = 'context [name] [type]';

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
        .option('env', {
            describe: 'Environment variables list',
            default: [],
            alias: 'e',
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
            data: prepareKeyValueFromCLIEnvOption(argv.env),
        };

        if (!data.name || !data.type) {
            throw new CFError('Name and type must be provided');
        }
    }

    const name  = data.name;
    const owner = data.owner;
    if (owner === 'account') {
        await context.createAccountContext(data);
        console.log(`Account context: ${name} created`);
    } else if (owner === 'user') {
        await context.createUserContext(data);
        console.log(`User context: ${name} created`);
    } else {
        throw new CFError(`Owner: ${owner} is not allowed. Use [account|user]`);
    }
};

module.exports = {
    command,
    builder,
    handler: wrapHandler(handler),
};
