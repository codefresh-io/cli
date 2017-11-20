
'use strict';
const command = require('../command');
const _       = require('lodash');

exports.command = 'images <command> [options]';
exports.describe = 'images in Codefresh';

exports.builder = function (yargs) {
    return yargs.option('url', {
        alias: 'url',
        default: 'https://g.codefresh.io'
    }).option('name', {
        type: 'string',
        alias: 'n',
        describe: 'name of the pipeline'
    }).help("h");
};

exports.handler = function (argv) {
    console.log('running');
    let info = {
        url: argv.url,
        name:argv.name,
        token: process.env.CF_TOKEN
    };

    command.getContextByName(info).then((res) => {
        console.log(res);
    }, (err) => {
        throw err;
    });


};