/**
 * Created by nikolai on 9/20/16.
 */
'use strict';
var debug   = require('debug')('login->index');
var Login   = require('../../login/connector');
var command = require('./../command');

exports.command = 'images <command> [options]';
exports.describe = 'images in Codefresh';

exports.builder = function (yargs) {
    return yargs.option('url', {
        alias: 'url',
        default: 'https://g.codefresh.io'
    }).option('account', {
        alias: 'a'
    }).option('table', {
        type: "boolean",
        describe: "output as table"
    }).option('pipelineId', {
        type: 'string',
        alias: 'id',
        describe: 'id of the pipeline'
    }).option('branch', {
        type: 'string',
        alias: 'b',
        describe: 'branch of the repository'
    }).option('noCache', {
        type: 'boolean',
        alias: 'nc',
        default: false,
        describe: 'choose if to use cache'
    }).option('resetVolume', {
        type: 'boolean',
        alias: 'rv',
        default: false,
        describe: 'choose if to reset volume'
    }).option('variables', {
            type: 'array',
            alias: 'v',
            default: {},
            describe: 'add the environment variables'
    }).option('repoName', {
        type: 'string',
        alias: 'rn',
        describe: 'name of the repository'
    }).option('repoOwner', {
        type: 'string',
        alias: 'ro',
        describe: 'name of the repository owner'
    }).option('pipelineName', {
        type: 'string',
        alias: 'pn',
        describe: 'name of the pipeline'
    }).help("h");
};

exports.handler = function (argv) {
    console.log('running');
    var info = {
        url: argv.url,
        account: argv.account,
        pipelineId: argv.pipelineId,
        table: argv.table,
        token: process.env.CF_TOKEN,
        branch : argv.branch,
        noCache : argv.noCache,
        resetVolume : argv.resetVolume,
        variables : argv.variables,
        repoName : argv.repoName,
        repoOwner: argv.repoOwner,
        pipelineName: argv.pipelineName
    };

    var login = new Login(argv.url,
        {
            access: {file: argv.tokenFile, token : argv.token},
            user: argv.user,
            password: argv.password
        });


    if (typeof info.token==="undefined") {
        login.connect().then((res) => {
            info.token = res;
            command.executePipeline(info).then((res) => {
                console.log("\nsuccess");
            }, (err) => {
                debug('error:' + err);
                process.exit(err);
            });
        }, (err) => {
            debug('error:' + err);
            process.exit(err);
        });
    }
    else {
        command.executePipeline(info).then((res) => {
            console.log("\nsuccess");
        }, (err) => {
            debug('error:' + err);
            process.exit(err);
        });
    }

   // login.connect().then(command.executePipeline(info), (err) => {
   //     debug('error:' + err);
   //     process.exit(err);
   // });
};