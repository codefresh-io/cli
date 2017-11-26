#!/usr/bin/env node
'use strict';
const yargs = require('yargs');
const path  = require('path');


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
    .command('builds' , 'api of builds', function (yargs) {
        argv = yargs
            .usage('usage: $0 builds <command> [options]')
            .command('ls', '-list of builds', require('./commands/builds/cmd/ls'))
            .command('build', '-certain build', require('./commands/builds/cmd/build'))
            .help('help')
            .wrap(null)
            .argv;
        checkCommands(yargs, argv, 2);
    })
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
    .command('compositions', 'actions with composition', function (yargs) {
        argv = yargs
            .usage('usage: $0 compositions <item> [options]')
            .command('ls', '-list of compositions', require('./commands/compositions/new/cmd/ls'))
            .command('create', '-create a composition', require('./commands/compositions/new/cmd/create'))
            .command('remove', '-remove a composition', require('./commands/compositions/new/cmd/remove'))
            .command('run', '-launch a composition', require('./commands/compositions/new/cmd/run'))
            .help('help')
            .wrap(null)
            .argv;
        checkCommands(yargs, argv, 2);
    })
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
    .command('pipeline', 'api of pipelines', function (yargs) {
        argv = yargs
            .usage('usage: $0 pipeline <item> [options]')
            .command('get', '-list of pipelines', require('./commands/pipeline/cmd/get'))
            .command('run', '-run a pipeline', require('./commands/pipeline/cmd/run'))
            .help('help')
            .wrap(null)
            .argv;
        checkCommands(yargs, argv, 2);
    })
    .command('nextpipeline', 'api of next generation pipeline', function (yargs) {
        argv = yargs
            .usage('usage: $0 nextpipeline <item> [options]')
            .command('create', '-create next generation pipeline', require('./commands/nextpipeline/cmd/create'))
            .command('delete', '-delete next generation pipeline', require('./commands/nextpipeline/cmd/delete'))
            .command('replace', '-replace next generation pipeline', require('./commands/nextpipeline/cmd/replace'))
            .command('get', '-get next generation pipeline', require('./commands/nextpipeline/cmd/get'))
            .help('help')
            .wrap(null)
            .argv;
        checkCommands(yargs, argv, 2);
    })
    .command('nextpipelines', 'api of next generation pipelines', function (yargs) {
        argv = yargs
            .usage('usage: $0 environments <item> [options]')
            .command('get', '-get next generation pipelines', require('./commands/nextpipelines/cmd/get'))
            .help('help')
            .wrap(null)
            .argv;
        checkCommands(yargs, argv, 2);
    })
    .command('context', 'api of context', function (yargs) {
        argv = yargs
            .usage('usage: $0 context <item> [options]')
            .command('create', '-create context', require('./commands/context/cmd/create'))
            .command('delete', '-delete context', require('./commands/context/cmd/delete'))
            .command('replace', '-replace context', require('./commands/context/cmd/replace'))
            .command('get', '-get context', require('./commands/context/cmd/get'))
            .help('help')
            .wrap(null)
            .argv;
        checkCommands(yargs, argv, 2);
    })
    .command('contexts', 'api of contexts', function (yargs) {
        argv = yargs
            .usage('usage: $0 contexts <item> [options]')
            .command('get', '-get contexts', require('./commands/contexts/cmd/get'))
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