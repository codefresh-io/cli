'use strict';
const command = require('./../command');
const _       = require('lodash');

exports.command = 'images <command> [options]';
exports.describe = 'images in Codefresh';

exports.builder = function (yargs) {
    return yargs.option('url', {
        alias: 'url',
        default: 'https://g.codefresh.io'
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
        authorization:argv.authorization,
        token: process.env.CF_TOKEN
    };

    command.getContexts(info).then((res) => {
        console.log(res);
    }, (err) => {
        throw err;
    });

};