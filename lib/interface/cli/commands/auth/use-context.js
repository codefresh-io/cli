const debug = require('debug')('codefresh:auth:use-context');
const CFError = require('cf-errors');
const _ = require('lodash');
const { wrapHandler } = require('../../helpers/general');
const { auth } = require('../../../../logic');
const authManager = auth.manager;


const command = 'use-context <name>';

const describe = 'use-context';

const builder = (yargs) => {
    return yargs
        .positional('context-name', {
            describe: 'a context-name that exists in cfconfig file',
            type: 'string',
        })
        .help();
};

const handler = (argv) => {
    const contextName = argv.name;

    const context = authManager.getContextByName(contextName);
    if (context) {
        authManager.setCurrentContext(context);
        authManager.persistContexts();
        console.log(`Switched to context ${contextName}`);
    } else {
        throw new CFError(`No context exists with the name: ${contextName}`);
    }
};

module.exports = {
    command,
    describe,
    builder,
    handler: wrapHandler(handler),
};
