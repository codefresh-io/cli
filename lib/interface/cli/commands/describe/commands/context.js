const debug           = require('debug')('codefresh:cli:create:context');
const CFError         = require('cf-errors');
const _               = require('lodash');
const { wrapHandler } = require('../../../helper');
const { context }     = require('../../../../../logic').api;
const yaml            = require('js-yaml');

const command = 'context [name]';

const builder = (yargs) => {
    return yargs
        .positional('name', {
            describe: 'Name of context',
        });
};

const handler = async (argv) => {
    const name  = argv.filename ? _.get(argv.filename, 'metadata.name') : argv.name;
    const owner = argv.filename ? _.get(argv.filename, 'owner') : argv.owner;

    if (!name) {
        throw new CFError('Name must be provided');
    }

    const resContext = await context.getContextByName(name, owner);
    console.log(yaml.safeDump(resContext));
};

module.exports = {
    command,
    builder,
    handler: wrapHandler(handler),
};
