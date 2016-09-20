#!/usr/bin/env node
'use strict';
var yargs = require('yargs');
var path  = require('path');

process.on('uncaughtException', function (err) {
    console.log(err);
});

function checkCommands (yargs, argv, numRequired) {
    if (argv._.length < numRequired) {
        yargs.showHelp();
    } else {
        // check for unknown command
    }
}

var argv = yargs.usage('usage: $0 <command>')
    .command('login' , 'login' , require('./commands/login'))
    .command('builds' , 'getAll/build a certain build', require('./commands/builds'))
    .command('images', 'api of images', function (yargs) {
        argv = yargs
            .usage('usage: $0 images <item> [options]')
            .command('ls', '-list of images', require('./commands/images/cmd/ls'))
            .command('get', '-get image by id', require('./commands/images/cmd/get'))
            .command('getTags', '-get list of tags', require('./commands/images/cmd/getTags'))
            .help('help')
            .wrap(null)
            .argv;
        checkCommands(yargs, argv, 2);
    })
    .command('compositions', 'add/remove/getAll/run composition in my account', require('./commands/compositions/new'))
    .command('environments', 'api of environments', function (yargs) {
        argv = yargs
            .usage('usage: $0 environments <item> [options]')
            .command('ls', '-list of envs', require('./commands/environments/cmd/ls'))
            .command('start', '-start env', require('./commands/environments/cmd/start'))
            .command('stop', '-stop env', require('./commands/environments/cmd/stop'))
            .command('status', '-status of env', require('./commands/environments/cmd/status'))
            .command('pause', '-pause env', require('./commands/environments/cmd/pause'))
            .command('unpause', '-unpause env', require('./commands/environments/cmd/unpause'))
            .command('terminate', '-terminate env by id', require('./commands/environments/cmd/terminate'))
            .command('terminateAll', '-terminate all envs', require('./commands/environments/cmd/terminateAll'))
            .help('help')
            .wrap(null)
            .argv;
        checkCommands(yargs, argv, 2);
    })
    .command('yaml', 'create codefresh.yml', require('./commands/yaml'))
    .demand(1, "must provide a valid command")
    .option('url', {
          alias: 'u',
          demand: true,
          describe: 'url must be provides',
          type: 'string'
    })
    .default('url', 'https://g.codefresh.io')
    .option('tokenFile', {
        demand: true,
        default: path.resolve(process.env.HOME,'.codefresh/accessToken.json'),
        describe: 'access token file',
        type: 'string',
        global : true
    })
    .option('accessToken', {
        alias: 'token',
        demand: false,
        describe: 'access token',
        type: 'string',
        global : true
    })
    .option('loglevel', {
        alias: 'log',
        demand : true,
        default: 'error',
        describe: 'loglevel',
        choices: ['error', 'info', 'debug'],
        global : true
    })
    .help("h")
    .alias("h", "help")
    .argv;