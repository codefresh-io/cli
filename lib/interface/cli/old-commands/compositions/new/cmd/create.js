/**
 * Created by nikolai on 9/23/16.
 */
/**
 * Created by nikolai on 9.8.16.
 */
'use strict';
var Login       = require('../../../login/connector');
var CFError     = require('cf-errors');
var prettyjson  = require('prettyjson');
var commands    = require('../command');

exports.command = 'compositions <command> [options]';
exports.describe = 'compositions in Codefresh';

const formatPayload = {
    isAdvanced: false,
    vars: [{"key":"test_key", "value":"test_value"}],
    yamlJson: "path to your composition.yml",
    name: "string"
};

exports.builder = function (yargs) {
    return yargs.option('url', {
        alias: 'url',
        default: 'https://g.codefresh.io'
    }).option('file', {
        demand: true,
        type: 'string',
        describe: 'path to file.json. Content of the file in format:\n' + JSON.stringify(formatPayload)
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
        file: argv.file,
        tofile: argv.tofile
    };

    var login = new Login(argv.url,
        {
            access: {file: argv.tokenFile, token : argv.token},
            user: argv.user,
            password: argv.password
        });

    var compositions = commands.add(info);

    login.connect().then(compositions.bind(login.token),
        (err) => {
            var cferror = new CFError({
                name: 'AuthorizationError',
                message: err.message
            });
            console.log(prettyjson.render({
                name: cferror.name,
                stack: cferror.stack
            }));
            process.exit(err);
        });
};