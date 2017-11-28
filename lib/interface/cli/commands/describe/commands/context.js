const debug           = require('debug')('codefresh:cli:create:context');
const CFError         = require('cf-errors');
const _               = require('lodash');
const { wrapHandler } = require('../../../helper');
const { context }     = require('../../../../../logic').api;

const command = 'context [name]';

const builder = (yargs) => {
    return yargs
        .positional('name', {
            describe: 'Name of context',
        });
};

const handler = async (argv) => {
    let name;

    if (argv.filename) {
        name = argv.filename.name;
    } else {
        name = argv.name;
    }

    if (!name) {
        throw new CFError('Name must be provided');
    }

    const resContext = await context.getContextByName(name);
    console.log(resContext);
};

module.exports = {
    command,
    builder,
    handler: wrapHandler(handler),
};
