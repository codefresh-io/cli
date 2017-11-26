'use strict';

const debug           = require('debug')('codefresh:auth:login');
const _               = require('lodash');
const CFError         = require('cf-errors');
const DEFAULTS        = require('../../../defaults');
const { auth }        = require('../../../../../logic');
const { JWTContext }  = auth.contexts;
const authManager     = auth.manager;
const { wrapHandler } = require('../../../helper');

const command = 'create-context <token>';

const describe = 'create-context';

const builder = (yargs) => {
    return yargs
        .usage('create-context options')
        .option('url', {
            describe: 'Codefresh system custom url',
            default: DEFAULTS.URL,
        })
        .positional('token', {
            describe: 'access token',
        })
        .option('type', {
            describe: 'context type',
            default: DEFAULTS.TYPE,
        })
};

const handler = async (argv) => {
    let authContext;

    authContext = await _loginWithToken(argv.url, argv.token);

    await authContext.validate();
    await authManager.addContext(authContext);
    await authManager.setCurrentContext(authContext);
    await authManager.persistContexts(authContext);

    console.log(`Create a new context: ${authContext.name}`);
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

module.exports = {
    command,
    describe,
    builder,
    handler: wrapHandler(handler),
};
