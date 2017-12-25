'use strict';

const debug = require('debug')('codefresh:auth:login');
const _ = require('lodash');
const CFError = require('cf-errors');
const DEFAULTS = require('../../defaults');
const { auth } = require('../../../../logic');
const { JWTContext } = auth.contexts;
const authManager = auth.manager;
const { wrapHandler } = require('../../helpers/general');

const command = 'login <username> <password>';

const describe = 'Login';

const builder = (yargs) => {
    return yargs
        .usage('Login options')
        .positional('username', {
            describe: 'username',
            required: true,
        })
        .positional('password', {
            describe: 'password',
            required: true,
        })
        .option('url', {
            describe: 'Codefresh system custom url',
            default: DEFAULTS.URL,
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
