/**
 * Created by nikolai on 9/20/16.
 */
'use strict';
var debug   = require('debug')('login->index');
var Login   = require('../../login/connector');
var command = require('./../command');

exports.command = 'environments <command> [options]';
exports.describe = 'environments in Codefresh';

exports.builder = function (yargs) {
    return yargs.option('url', {
        alias: 'url',
        default: 'https://g.codefresh.io'
    }).option('account', {
        alias: 'a'
    }).option('id', {
        demand: true,
        type: 'string',
        describe: `id of environment`
    })
        .help("h")
        .alias("h","help");
};

exports.handler = function (argv) {
    console.log('running');
    var info = {
        url: argv.url,
        account: argv.account,
        id: argv.id,
        targetUrl: `${argv.url}/api/environments/${argv.id}/terminate`
    };

    var login = new Login(argv.url,
        {
            user: argv.user,
            password : argv.password,
            access:{file: argv.tokenFile, token : argv.token}
        });

    var environments = command.get(info);

    login.connect().then(environments.bind(login.token), (err) => {
        debug('error:' + err);
        process.exit(err);
    });
};