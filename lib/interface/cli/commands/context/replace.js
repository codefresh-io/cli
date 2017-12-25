const debug = require('debug')('codefresh:cli:replace:context');
const CFError = require('cf-errors');
const _ = require('lodash');
const { wrapHandler } = require('../../helpers/general');
const { context } = require('../../../../logic').api;

const command = 'context';

const describe = 'Replace a context resource';

const builder = (yargs) => {
    return yargs;
};

const handler = async (argv) => {
    const data = argv.filename;
    const name = _.get(data, 'metadata.name');

    if (!name) {
        throw new CFError('Missing name in metadata');
    }

    await context.replaceByName(name, data);

    console.log(`Context: ${name} replaced`);
};

module.exports = {
    command,
    describe,
    builder,
    handler: wrapHandler(handler),
};
