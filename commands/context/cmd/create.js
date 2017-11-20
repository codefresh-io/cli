
'use strict';
const command = require('../command');
const _       = require('lodash');

exports.command = 'images <command> [options]';
exports.describe = 'images in Codefresh';

exports.builder = function (yargs) {
    return yargs.option('url', {
        alias: 'url',
        default: 'https://g.codefresh.io'
    }).option('file', {
        type: 'string',
        alias: 'f',
        describe: 'path to the yaml file'
    }).help("h");
};

exports.handler = function (argv) {
    console.log('running');
    let info = {
        url: argv.url,
        file:argv.file,
        token: process.env.CF_TOKEN
    };

    command.createContextByFile(info).then((res) => {
        console.log(res);
    }, (err) => {
        throw err;
    });


};