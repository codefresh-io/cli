/**
 * Created by nikolai on 3/2/17.
 */

'use strict';
var Login   = require('../../login/connector');
var command = require('../command');

exports.command = 'images <command> [options]';
exports.describe = 'images in Codefresh';

exports.builder = function (yargs) {
    return yargs.option('url', {
        alias: 'url',
        default: 'https://g.codefresh.io'
    }).option('account', {
        alias: 'a'
    }).option('name', {
        demand: true,
        type: 'string',
        describe: `name of the Image`
    }).option('sha', {
        demand: true,
        type: 'string',
        describe: `sha of the Image`
    })
        .help("h")
        .alias("h","help");
};

exports.handler = function (argv) {

    var info = {
        url: argv.url,
        account: argv.account,
        name: argv.name,
        sha: argv.sha,
        targetUrl: `${argv.url}/api/runtime/testit`
    };

    var login = new Login(argv.url,
        {
            access: {file: argv.tokenFile, token : argv.token},
            user: argv.user,
            password: argv.password
        });

    var images = command.run(info);

    login.connect().then(images.bind(login.token), (err) => {
        console.log('error:' + err);
        process.exit(err);
    }).catch( (err) => {
        console.log('error:' + err);
    });
};

