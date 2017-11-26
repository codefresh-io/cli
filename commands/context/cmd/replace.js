
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
        describe: 'name of the pipeline'
    }).option('authorization', {
        type: 'string',
        alias: 'a',
        demand: true,
        choices: ['account', 'user'],
        describe: 'set your authorization'
    }).option('variables', {
        type: 'array',
        alias: 'v',
        default: {},
        describe: 'add the environment variables'
    }).help("h");
};

exports.handler = function (argv) {
    console.log('running');
    let info = {
        url: argv.url,
        file:argv.file,
        authorization:argv.authorization,
        token: process.env.CF_TOKEN,
        variables:argv.variables
    };

    command.createOrReplaceContextByFile(info).then((res) => {
        console.log(res);
    }, (err) => {
        throw err;
    });


};