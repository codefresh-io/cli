'use strict';

const debug           = require('debug')('codefresh:auth:login');
const _               = require('lodash');
const CFError         = require('cf-errors');
const DEFAULTS        = require('../../../defaults');
const { auth }        = require('../../../../../logic');
const { JWTContext }  = auth.contexts;
const authManager     = auth.manager;
const { wrapHandler } = require('../../../helper');

const command = 'login';

const describe = 'Login';

const builder = (yargs) => {
    return yargs
        .usage('Login options')
        .option('url', {
            describe: 'Codefresh system custom url',
            default: DEFAULTS.URL,
        })
        .option('username', {
            describe: 'username',
            required: true,
        })
        .option('password', {
            describe: 'password',
            required: true,
        });
};

const handler = async (argv) => {
    const authContext = await _loginWithUserPassword(argv.username, argv.password);

    await authContext.validate();
    await authManager.addContext(authContext);
    await authManager.setCurrentContext(authContext);
    await authManager.persistContexts(authContext);

    console.log(`Login succeeded to ${authContext.url}`);
    console.log(`Switched to context: ${authContext.name}`);
};



const _loginWithUserPassword = async (username, password) => {
    try {
        // TODO implement logic to get token by calling the pai
    } catch (err) {
        throw new CFError({
            cause: err,
            message: 'Failed to login with username and password',
        });
    }
};

module.exports = {
    command,
    describe,
    builder,
    handler: wrapHandler(handler),
};
