const debug           = require('debug')('codefresh:cli:create:context');
const CFError         = require('cf-errors');
const _               = require('lodash');
const { wrapHandler } = require('../../../helper');
const { environment } = require('../../../../../logic').api;

const command = 'environment <id>';

const builder = (yargs) => {
    return yargs
        .positional('id', {
            describe: 'Environment id',
        });
};

//TODO: need to add also the option for delete by name?
const handler = async (argv) => {
    const id = argv.id;
    await environment.deleteEnvironment(id);
    console.log(`Environment: ${id} deleted`);
};

module.exports = {
    command,
    builder,
    handler: wrapHandler(handler),
};
