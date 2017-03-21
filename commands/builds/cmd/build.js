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
    }).option('pipelineName', {
        demand: false,
        describe: 'name of pipeline from repo'
    }).option('branch', {
        demand: false,
        describe: 'name of branch'
    }).option('sha', {
        demand: false,
        describe: 'sha of commit'
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
        operation: argv.operation,
        pipelineName: argv.pipelineName,
        sha: argv.sha,
        branch: argv.branch
    };

    var login = new Login(argv.url,
        {
            access:{file: argv.tokenFile, token : argv.token},
            user: argv.user,
            password: argv.password
        });

    var builds;
    if(!info.pipelineName) {
        builds = commands.buildDefaultPipeline(info);
    } else {
        builds = commands.build(info);
    }

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