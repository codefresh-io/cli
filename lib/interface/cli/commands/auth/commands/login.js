'use strict';

const debug    = require('debug')('auth:login');
const Promise  = require('bluebird');
const _        = require('lodash');
const CFError  = require('cf-errors');
const jwt      = require('jsonwebtoken');
const DEFAULTS = require('../../../../defaults');
const context  = require('../../../context');
const api      = require('../../../../api');

const command = 'login';

const describe = 'Login';

const builder = (yargs) => {
    return yargs
        .usage('Login options')
        .option('url', {
            describe: 'Codefresh system custom url',
            default: DEFAULTS.URL
        })
        .option('token', {
            describe: 'access token',
        })
        .option('username', {
            conflicts: 'token'
        })
        .option('password', {
            conflicts: 'token'
        })
        .help();
};

const handler = async (argv) => {
    let authContext;

    if (argv.token) {
        try {
            authContext = await _loginWithToken(argv.url, argv.token);
        }
        catch (err) {
            throw new CFError({
                cause: err,
                message: 'Failed to login with token'
            });
        }
    }

    if (argv.username && argv.password) {
        try {
            authContext = await _loginWithUserPassword(argv.username, argv.password);
        }
        catch (err) {
            throw new CFError({
                cause: err,
                message: 'Failed to login with username and password'
            });
        }
    }

    console.log(`Login succeeded: ${authContext.toString()}`);
};


const _loginWithToken = async (url, token) => {
    try {

        let decodedToken;
        try {
            decodedToken = jwt.decode(token);
        }
        catch (err) {
            throw new Error('Passed token is not a valid token');
        }

        if (!decodedToken) {
            throw new Error('Passed token is not a valid token');
        }

        const decoded = jwt.decode(token);
        const user    = await api.user.get(null, { token });

        const account     = _.find(user.account, (acc) => {
            return acc._id.toString() === decoded.accountId;
        });
        const authContext = {
            key: `${user.userName}-${account.name}`,
            url: url,
            aclType: 'account',
            tokenType: 'jwt',
            userId: user._id.toString(),
            accountId: account._id.toString()
        };

        return await context.createOrUpdate(authContext);
    }
    catch (err) {
        const error = new CFError({
            cause: err,
            message: 'Failed to login with token'
        });
        throw error;
    }
};

const _loginWithUserPassword = async (username, password) => {
    // TODO implement logic to get token by calling the pai
};

module.exports = {
    command,
    describe,
    builder,
    handler
};
