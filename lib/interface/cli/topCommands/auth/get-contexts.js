const debug           = require('debug')('codefresh:auth:get-contexts');
const _               = require('lodash');
const { wrapHandler } = require('../../helper');
const Table           = require('cli-table');
const { printTableForAuthContexts }        = require('../../helper');



const command = 'get-contexts';

const describe = 'get-contexts';

const builder = (yargs) => {
    return yargs
        .help();
};

const handler = (argv) => {
    printTableForAuthContexts();
};

module.exports = {
    command,
    describe,
    builder,
    handler: wrapHandler(handler),
};
