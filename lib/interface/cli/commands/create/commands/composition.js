const debug                                            = require('debug')('codefresh:cli:create:context');
const CFError                                          = require('cf-errors');
const _                                                = require('lodash');
const { wrapHandler, prepareKeyValueFromCLIEnvOption } = require('../../../helper');
const { composition }                                  = require('../../../../../logic').api;

const command = 'composition';

const describe = 'Create a composition';

const builder = (yargs) => {
    return yargs;
};

const handler = async (argv) => {
    const data = argv.filename;

    await composition.createComposition(data);
    console.log(`Composition: ${data.name} created`);
};

module.exports = {
    command,
    describe,
    builder,
    handler: wrapHandler(handler),
};
