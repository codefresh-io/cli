
'use strict';
const command = require('../command');
const _       = require('lodash');

exports.command = 'nextpipeline <command> [options]';
exports.describe = 'delete codefresh new generation pipeline';

exports.builder = function (yargs) {
    return yargs.option('url', {
        alias: 'url',
        default: 'https://g.codefresh.io'
    }).option('name', {
        type: 'string',
        alias: 'n',
        describe: 'name of the pipeline'
    }).option('file', {
        type: 'string',
        alias: 'f',
        describe: 'path to file'
    }).help("h");
};

exports.handler = function (argv) {
    console.log('running');
    let info = {
        url: argv.url,
        name: argv.name,
        file: argv.file,
        token: process.env.CF_TOKEN
    };

    if (!_.isUndefined(info.name)) {
        command.deleteContextByName(info).then((res) => {
            console.log(res);
        }, (err) => {
            throw err;
        });
    }
    else if (!_.isUndefined(info.file)) {
        command.deleteContextByFile(info).then((res) => {
            console.log(res);
        }, (err) => {
            throw err;
        });
    }
    else{
        throw new CFError("must provide [FILE] or [NAME] of the pipeline")
    }


};