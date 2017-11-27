const debug            = require('debug')('codefresh:cli:create:context');
const CFError          = require('cf-errors');
const _                = require('lodash');
const { wrapHandler }  = require('../../../helper');
const { context }      = require('../../../../../logic').api;

const command = 'context [name]';

const builder = (yargs) => {
    return yargs
        .positional('name', {
            describe: 'Name of context',
        })
        .option('owner', {
            describe: 'Owner of the context',
            choices: ['user', 'account'],
            default: 'account',
        })
};

const handler = async (argv) => {
    let data;

    if (argv.filename) {
        data = argv.filename;
    } else {
        data = {
            name: argv.name,
            owner: argv.owner,
        };

        if (!data.name) {
            throw new CFError('Name must be provided');
        }
    }

    const name  = data.name;
    const owner = data.owner;
    if (owner === 'account') {
        await context.getAccountContextByName(name);
        console.log(`Account context: ${name} created`);
    } else if (owner === 'user') {
        await context.getUserContextByName(name);
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
