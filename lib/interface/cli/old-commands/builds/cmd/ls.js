/**
 * Created by nikolai on 9/22/16.
 */
'use strict';
var CFError     = require('cf-errors');
var Login       = require('../../login/connector');
var prettyjson  = require('prettyjson');
var commands    = require('../command');

exports.command = 'builds <command> [options]';

exports.describe = 'build in codefresh ';

exports.builder = function (yargs) {
    return yargs.option('url', {
        alias: 'url',
        default: 'https://g.codefresh.io'
    }).option('account', {
        demand: true,
        alias: 'a',
        describe: 'account name'
    }).option('repo', {
        demand: true,
        alias: 'r',
        describe: 'repo name'
    }).option('repoOwner', {
        demand: true,
        alias: 'o',
        describe: 'repo owner'
    }).option('type', {
        default: 'normal',
        alias: 't',
        describe: 'type of build - yml/normal'
    }).option('limit', {
        type: "number",
        describe: "limit of builds"
    }).option('tofile', {
        type: 'string',
        describe: 'save output to file'
    }).option('table', {
        type: "boolean",
        describe: "output as table"
    })
        .help("h")
        .alias("h","help");
};

exports.handler = function (argv) {
    var info = {
        url: argv.url,
        account: argv.account,
        repoOwner: argv.repoOwner,
        repoName: argv.repo,
        tofile: argv.tofile,
        table: argv.table,
        type: argv.type,
        limit: argv.limit
    };

    let urlParams = `account=${info.account}&repoOwner=${info.repoOwner}&repoName=${info.repoName}`;
    if(info.limit) {
        urlParams = `limit=${info.limit}&account=${info.account}&repoOwner=${info.repoOwner}&repoName=${info.repoName}`;
    }
    if(info.type === 'yml') {
        info.targetUrl = `${info.url}/api/workflow?${urlParams}&type=webhook`;
    } else {
        info.targetUrl = `${info.url}/api/builds?${urlParams}`;
    }

    var login = new Login(argv.url,
        {
            access:{file: argv.tokenFile, token : argv.token},
            user: argv.user,
            password: argv.password
        });

    var builds = commands.getAll(info);

    login.connect().then(builds.bind(login.token),
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