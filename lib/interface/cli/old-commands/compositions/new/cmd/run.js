/**
 * Created by nikolai on 9/23/16.
 */
'use strict';
var Login       = require('../../../login/connector');
var CFError     = require('cf-errors');
var prettyjson  = require('prettyjson');
var commands    = require('../command');

exports.command = 'compositions <command> [options]';
exports.describe = 'compositions in Codefresh';

const formatVars = [{"key":"", "value":""}];

exports.builder = function (yargs) {
    return yargs.option('url', {
        alias: 'url',
        default: 'https://g.codefresh.io'
    }).option('vars', {
        default: [],
        describe: 'composition variables. Format ' + JSON.stringify(formatVars)
    }).option('id', {
        demand: true,
        type: 'string',
        describe: 'index of composition that you want to remove'
    })
        .help("h")
        .alias("h","help");
};

exports.handler = function (argv) {
    var info = {
        url: argv.url,
        vars: argv.vars,
        id: argv.id
    };

    var login = new Login(argv.url,
        {
            access: {file: argv.tokenFile, token : argv.token},
            user: argv.user,
            password: argv.password
        });

    var compositions = commands.run(info);

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