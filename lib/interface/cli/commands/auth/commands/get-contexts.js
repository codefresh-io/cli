'use strict';

const debug      = require('debug')('login:index');
const DEFAULTS   = require('../../../defaults');
const prettyjson = require('prettyjson');

const command = 'get-contexts';

const describe = 'get-contexts';

const builder = (yargs) => {
    return yargs
        .option('url', {
            describe: 'Codefresh system custom url',
            default: DEFAULTS.URL
        })
        .option('token', {
            describe: 'access token',
        })
        .option('user', {})
        .option('password', {})
        .help();
};

const handler = (argv) => {

};

module.exports = {
    command,
    describe,
    builder,
    handler
};
