
'use strict';
const command = require('../command');
const _       = require('lodash');

exports.command = 'images <command> [options]';
exports.describe = 'images in Codefresh';

exports.builder = function (yargs) {
    return yargs.option('url', {
        alias: 'u',
        default: 'https://g.codefresh.io'
    }).option('file', {
        type: 'string',
        alias: 'f',
        describe: 'path to the yaml file'
    }).option('authorization', {
        type: 'string',
        alias: 'a',
        demand: true,
        choices: ['account', 'user'],
        describe: 'set your authorization'
    }).help("h");
};

exports.handler = function (argv) {
    console.log('running');
    let info = {
        url: argv.url,
        file:argv.file,
        authorization:argv.authorization,
        token: process.env.CF_TOKEN
    };

    command.createOrReplaceContextByFile(info).then((res) => {
        console.log(res);
    }, (err) => {
        throw err;
    });


};