const debug = require('debug')('codefresh:auth:current-context');
const CFError = require('cf-errors');
const { wrapHandler } = require('../../helpers/general');
const { auth } = require('../../../../logic');
const authManager = auth.manager;


const command = 'current-context';

const describe = 'current-context';

const builder = (yargs) => {
    return yargs
        .help();
};

const handler = (argv) => {
    const currentContext = authManager.getCurrentContext();
    if (currentContext) {
        console.log(currentContext.getName());
    } else {
        throw new CFError('There are no contexts in cfconfig file');
    }
};

module.exports = {
    command,
    describe,
    builder,
    handler: wrapHandler(handler),
};
