/**
 * Created by nikolai on 9.8.16.
 */
'use strict';

var debug   = require('debug')('login->index');
var Login   = require('../login/connector');
var assert  = require('assert');

exports.command = 'compositions [account] <operation> <compositionFile>';
exports.describe = 'compositions in Codefresh';

exports.builder = function (yargs) {
    return yargs.option('url', {
        alias: 'url',
        default: 'https://g.codefresh.io'
    }).option('account', {
        alias: 'a'
    }).option('yamlJson', {
        alias: 'yaml'
    }).option('name', {
        alias: 'name'
    }).option('vars', {
        default: []
    }).option('advanced',{
        default: true
    }).option('compositionFile',{

    }).option('operation',{
        default: 'none'
    })
};

exports.handler = function (argv) {
    console.log('running');
    debug(`${argv.url}`);
    debug(`${JSON.stringify(argv)}`);
    debug(`${argv.account}`);
    debug(`${argv.yamlJson}`);
    debug(`${argv.name}`);
    debug(`${argv.vars}`);
    debug(`${argv.advanced}`);
    //debug(`${argv.payload}`);

    var info = {
        url: argv.url,
        account: argv.account,
        vars: argv.vars,
        payload: argv.payload,
        operation: argv.operation,
        id: argv.id // remove composition
    };

    var login = new Login(argv.user, argv.password, argv.url, {file: argv.tokenFile, token : argv.token});
    var compositions;
    switch (info.operation) {
        case 'add':
            compositions = require('./command').add(info);
            break;
        case 'remove':
            compositions = require('./command').remove(info);
            break;
        case 'run':
            compositions = require('./command').run(info);
            break;
        case 'getAll':
            compositions = require('./command').getAll(info);
            break;
        case 'none':
            console.log('operation is none');
        default :
            let err = new Error('Please, specify --operation that you want to do [add/remove/run/getAll]');
            debug('error:' + err);
            throw err;
    }

    login.connect().then(compositions.bind(login.token), (err) => {
        debug('error:' + err);
        process.exit(err);
    });
};