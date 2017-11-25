'use strict';

const debug           = require('debug')('codefresh:auth:login');
const Promise         = require('bluebird');
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
        .option('token', {
            describe: 'access token',
        })
        .option('username', {
            conflicts: 'token',
        })
        .option('password', {
            conflicts: 'token',
        })
        .help();
};

const handler = async (argv) => {
    let authContext;

    if (argv.token) {
        authContext = await _loginWithToken(argv.url, argv.token);
    }

    if (argv.username && argv.password) {
        authContext = await _loginWithUserPassword(argv.username, argv.password);
    }

    await authContext.validate();
    await authManager.addContext(authContext);
    await authManager.setCurrentContext(authContext);
    await authManager.persistContexts(authContext);

    console.log(`Login succeeded: ${authContext.toString()}`);
};


const _loginWithToken = async (url, token) => {
    try {
        const authContext = JWTContext.createFromToken(token, url);
        return authContext;

    } catch (err) {
        const error = new CFError({
            cause: err,
            message: 'Failed to login with token',
        });
        throw error;
    }
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
