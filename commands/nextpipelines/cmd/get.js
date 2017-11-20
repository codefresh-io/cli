/**
 * Created by nikolai on 9/20/16.
 */
'use strict';
const command = require('./../command');
const _       = require('lodash');

exports.command = 'images <command> [options]';
exports.describe = 'images in Codefresh';

exports.builder = function (yargs) {
    return yargs.option('url', {
        alias: 'url',
        default: 'https://g.codefresh.io'
    }).help("h");
};

exports.handler = function (argv) {
    console.log('running');
    let info = {
        url: argv.url,
        token: process.env.CF_TOKEN
    };

    command.getPipelines(info).then((res) => {
        console.log(res);
    }, (err) => {
        throw err;
    });

};