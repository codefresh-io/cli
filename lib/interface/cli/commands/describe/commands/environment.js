const debug           = require('debug')('codefresh:cli:create:context');
const CFError         = require('cf-errors');
const _               = require('lodash');
const { wrapHandler } = require('../../../helper');
const { environment }       = require('../../../../../logic').api;

const command = 'environment <id>';

const describe = 'describe environment';

const builder = (yargs) => {
    return yargs
        .positional('id', {
            describe: 'environment id',
        });
};

const handler = async (argv) => {
    const id = argv.filename ? _.get(argv.filename, 'id') : argv.id;
    const currEnvironment = await environment.getEnvironmentById(id);
    console.log(currEnvironment.describe());
};

module.exports = {
    command,
    describe,
    builder,
    handler: wrapHandler(handler),
};
