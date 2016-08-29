/**
 * Created by nikolai on 12.8.16.
 */
'use strict';
var debug   = require('debug')('login->index');
var Login   = require('../login/connector');
var _       = require('lodash');
var command = require('./command');

exports.command = 'images [account] <operation>';
exports.describe = 'images in Codefresh';

var allOperations = ['get', 'getAll', 'getTags'];

exports.builder = function (yargs) {
    return yargs.option('url', {
        alias: 'url',
        default: 'https://g.codefresh.io'
    }).option('account', {
        alias: 'a'
    }).option('operation',{
        demand: true,
        type: 'string',
        describe: `available the following operations with ${JSON.stringify(allOperations)}`
    }).option('id', {
        type: 'string',
        describe: `id of the Image`
    }).option('imageName',{
        type: 'string',
        describe: `name of the image`
    }).option('tofile',{
        type: 'string',
        describe: 'save results to file'
    })
        .help("h")
        .alias("h","help");
};

exports.handler = function (argv) {
    console.log('running');
    var info = {
        url: argv.url,
        account: argv.account,
        operation: argv.operation,
        id: argv.id,
        imageName: argv.imageName,
        tofile: argv.tofile
    };

    if(!_.includes(allOperations, argv.operation)) {
        throw new Error(`Use one of the following operations: ${JSON.stringify(allOperations)}`);
    }

    var login = new Login(argv.url,
        {
            access: {file: argv.tokenFile, token : argv.token},
            user: argv.user,
            password: argv.password
        });

    var images;
    switch(argv.operation) {
        case 'get':
        case 'getTags':
        case 'getAll':
            images = command.get(info);
            break;
    }
    login.connect().then(images.bind(login.token), (err) => {
        debug('error:' + err);
        process.exit(err);
    });
};