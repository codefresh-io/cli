const debug           = require('debug')('codefresh:cli:create:context');
const CFError         = require('cf-errors');
const _               = require('lodash');
const { wrapHandler } = require('../../../helper');
const { context }     = require('../../../../../logic').api;

const command = 'context';

const describe = 'Apply changes to a context';

const builder = (yargs) => {
    return yargs;
};

const handler = async (argv) => {
    const data = argv.filename;
    const name = _.get(data, 'metadata.name');

    if (!name) {
        throw new CFError('Missing name in metadata');
    }

    try {
        await context.getContextByName(name);

        await context.applyByName(name, data);
        console.log(`Context: ${name} patched`);
    } catch (err) {
        if (err) {
            await context.createContext(data);
            console.log(`Context: ${name} created`);
        } else {
            throw err;
        }
    }
};

module.exports = {
    command,
    describe,
    builder,
    handler: wrapHandler(handler),
};
