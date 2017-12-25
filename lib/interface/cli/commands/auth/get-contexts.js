const debug = require('debug')('codefresh:auth:get-contexts');
const _ = require('lodash');
const { wrapHandler } = require('../../helpers/general');
const { printTableForAuthContexts } = require('../../helpers/auth');


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
