/**
 * Created by nikolai on 9/20/16.
 */
'use strict';
const Login   = require('../../login/connector');
const command = require('./../command');
const _       = require('lodash');

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
    }).option('repoOwner', {
        type: 'string',
        alias: 'ro',
        describe: 'owner of the repository'
    }).option('repoName', {
        type: 'string',
        alias: 'rn',
        describe: 'name of the repository'
    }).option('pipelineName', {
        type: 'string',
        alias: 'pn',
        describe: 'name of the pipeline'
    })
        .help("h");
};

exports.handler = function (argv) {
    console.log('running');
    let info = {
        url: argv.url,
        account: argv.account,
        repoOwner: argv.repoOwner,
        repoName: argv.repoName,
        pipelineName: argv.pipelineName,
        table: argv.table,
        token: process.env.CF_TOKEN
    };

    let login = new Login(argv.url,
        {
            access: {file: argv.tokenFile, token : argv.token},
            user: argv.user,
            password: argv.password
        });




    if (!_.isUndefined(info.token)) {
        login.connect().then((res) => {
            info.token = res;
            command.getAllByUser(info).then((res) => {
                console.log("\n success");
            }, (err) => {
                console.log(err);
                process.exit(err);
            });
        }, (err) => {
            console.log(err);
            process.exit(err);
        });
    }
    else {
        command.getAllByUser(info).then((res) => {
            console.log("\n success");
        }, (err) => {
            console.log(err);
            process.exit(err);
        });
    }


  //  login.connect().then(command.getAllByUser(info), (err) => {
  //      debug('error:' + err);
  //      process.exit(err);
  //  });
};