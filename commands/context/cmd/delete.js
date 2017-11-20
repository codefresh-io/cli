
'use strict';
const command = require('../command');
const _       = require('lodash');

exports.command = 'nextpipeline <command> [options]';
exports.describe = 'delete codefresh new generation pipeline';

exports.builder = function (yargs) {
    return yargs.option('url', {
        alias: 'u',
        default: 'https://g.codefresh.io'
    }).option('name', {
        type: 'string',
        alias: 'n',
        describe: 'name of the pipeline'
    }).option('file', {
        type: 'string',
        alias: 'f',
        describe: 'path to file'
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
        name: argv.name,
        file: argv.file,
        authorization:argv.authorization,
        token: process.env.CF_TOKEN
    };

    if (_.isUndefined(info.name) && _.isUndefined(info.file)) {
        throw new CFError("must provide [FILE] or [NAME] of the pipeline");
    }
    else {
        command.deleteContext(info).then((res) => {
            console.log(res);
        }, (err) => {
            throw err;
        });
    }


};