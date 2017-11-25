/**
 * Created by nikolai on 9/22/16.
 */
'use strict';
var Login   = require('../../../login/connector');
var CFError = require('cf-errors');
var prettyjson  = require('prettyjson');
var commands    = require('../command');

exports.command = 'compositions <command> [options]';
exports.describe = 'compositions in Codefresh';

exports.builder = function (yargs) {
    return yargs.option('url', {
        alias: 'url',
        default: 'https://g.codefresh.io'
    }).option('account', {
        alias: 'a'
    }).option('tofile', {
        type: 'string',
        describe: 'filename, output to file'
    }).option('table', {
        type: 'boolean',
        describe: 'output as table'
    })
        .help("h")
        .alias("h","help");
};

exports.handler = function (argv) {
    var info = {
        url: argv.url,
        account: argv.account,
        tofile: argv.tofile,
        table: argv.table
    };

    var login = new Login(argv.url,
        {
            access: {file: argv.tokenFile, token : argv.token},
            user: argv.user,
            password: argv.password
        });

    var compositions = commands.getAll(info);

    login.connect().then(compositions.bind(login.token),
        (err) => {
            var cferror = new CFError({
                name: 'AuthorizationError',
                message: err.message
            });
            console.log(prettyjson.render({
                name: cferror.name,
                stack: cferror.stack
            }));
            process.exit(err);
        });
};