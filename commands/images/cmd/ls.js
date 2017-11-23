/**
 * Created by nikolai on 9/20/16.
 */

'use strict';
var debug   = require('debug')('login->index');
var Login   = require('../../login/connector');
var command = require('./../command');
const _ = require('lodash');

exports.command = 'images [account] <operation>';
exports.describe = 'images in Codefresh';

exports.builder = function (yargs) {
    return yargs.option('url', {
        alias: 'url',
        default: 'https://g.codefresh.io'
    }).option('annotation', {
        alias: 'a',
        type: 'array'
    }).options('sha', {
        alias: 's',
        type: 'string'
    }).option('tofile',{
        type: 'string',
        describe: 'save results to file'
    }).option('table', {
        type: "boolean",
        describe: "output as table"
    }).option('list', {
      type: "boolean",
      describe:" output as list"
    }).option('limit', {
        type: "number",
        describe: "limit of images"
    })
        .help("h")
        .alias("h","help");
};

exports.handler = function (argv) {
    const annotation = {};

    _.forEach(argv.annotation, (m) => {
        const splitted = m.split('=');
        annotation[splitted[0]] = splitted[1];
    });

    var info = {
        url: argv.url,
        tofile: argv.tofile,
        table: argv.table,
        list: argv.list,
        limit: argv.limit,
        annotation: annotation,
        sha: argv.sha,
        targetUrl: `${argv.url}/api/images`
    };

    var login = new Login(argv.url,
        {
            access: {file: argv.tokenFile, token : argv.token},
            user: argv.user,
            password: argv.password
        });

    var images = command.get(info);

    login.connect().then(images.bind(login.token), (err) => {
        debug('error:' + err);
        process.exit(err);
    });
};