/**
 * Created by nikolai on 9.8.16.
 */
'use strict';

var debug   = require('debug')('login->index');
var Login   = require('../../login/connector');
var _       = require('lodash');


exports.command = 'compositions [account] <operation>';
exports.describe = 'compositions in Codefresh';

const formatPayload = {
    isAdvanced: false,
    vars: [{"key":"test_key", "value":"test_value"}],
    yamlJson: "path to your composition.yml",
    name: "string"
};

const formatVars = [{"key":"", "value":""}];
var allOperations = [
    'add', 'run',
    'getAll', 'remove'
];

exports.builder = function (yargs) {
    return yargs.option('url', {
        alias: 'url',
        default: 'https://g.codefresh.io'
    }).option('account', {
        alias: 'a'
    }).option('vars', {
        default: [],
        describe: 'composition variables. Format ' + JSON.stringify(formatVars)
    }).option('file',{
        type: 'string',
        describe: 'path to file.json. Content of the file in format:\n' + JSON.stringify(formatPayload)
    }).option('operation',{
        demand: true,
        type: 'string',
        describe: 'available the following operations with composition add/run/getAll/remove'
    }).option('id', {
        type: 'string',
        describe: 'index of composition that you want to remove'
    }).option('tofile',{
        type: 'string',
        describe: 'filename, output to file'
    })
        .help("h")
        .alias("h","help");
};

exports.handler = function (argv) {
    var info = {
        url: argv.url,
        account: argv.account,
        vars: argv.vars,
        file: argv.file,
        operation: argv.operation,
        id: argv.id,
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