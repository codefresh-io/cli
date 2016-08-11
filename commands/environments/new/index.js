/**
 * Created by nikolai on 10.8.16.
 */
'use strict';
var debug   = require('debug')('login->index');
var Login   = require('../../login/connector');
var assert  = require('assert');
var _       = require('lodash');
var command = require('./command');

exports.command = 'environments [account] <operation>';
exports.describe = 'environments in Codefresh';

var allOperations = [
    'stop', 'start',
    'pause', 'unpause',
    'terminate', 'status',
    'terminateAll',
    'getAll', 'rename'];

var idOperations = [
    'stop', 'start',
    'pause', 'unpause',
    'terminate', 'status',
    'rename'];

exports.builder = function (yargs) {
    return yargs.option('url', {
        alias: 'url',
        default: 'https://g.codefresh.io'
    }).option('account', {
        alias: 'a'
    }).option('operation',{
        demand: true,
        type: 'string',
        describe: `available the following operations with environments ${JSON.stringify(allOperations)}`
    }).option('id', {
        type: 'string',
        describe: `index of environment that you want to ${JSON.stringify(idOperations)}`
    }).option('newName',{
        type: 'string',
        describe: `The new name to assign to the environment`
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
        newName: argv.newName
    };

    if(!_.includes(allOperations, argv.operation)) {
        throw new Error(`Use one of the following operations: ${JSON.stringify(allOperations)}`);
    }

    var login = new Login(argv.user, argv.password, argv.url, {file: argv.tokenFile, token : argv.token});

    var environments;
    switch(argv.operation) {
        case 'terminateAll':
            info.id = 'all';
        case 'status':
        case 'stop':
        case 'start':
        case 'pause':
        case 'unpause':
        case 'terminate':
        case 'getAll':
        case 'rename':
            environments = command.get(info);
            break;
    }
    login.connect().then(environments.bind(login.token), (err) => {
        debug('error:' + err);
        process.exit(err);
    });
};