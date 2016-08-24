#!/usr/bin/env node

var yargs = require('yargs');
var path  = require('path');

process.on('uncaughtException', function (err) {
    console.log(err);
});

var argv = yargs.usage("$0 command")
    .command('login' , 'login' , require('./commands/login'))
    .command('builds' , 'bring list of current builds', require('./commands/builds'))
    .command('images', 'bring all images of my account', require('./commands/images'))
    .command('compositions_v2', 'add/remove/update/run composition in my account', require('./commands/compositions/new'))
    .command('compositions', 'verchol compositions', require('./commands/compositions'))
    .command('environments', 'getAll/ environment', require('./commands/environments/new'))
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
