// #! /usr/bin/env node

  var yargs = require("yargs");
  console.log('yargs');
  process.on('uncaughtException', function (err) {
    console.log(err);
  })


  var argv = yargs.usage("$0 command")

    .command('login' , 'login' , require('./commands/login'))
    .command('me', 'check if i am logged in')
    .command('builds' , 'bring list of current builds', require('./commands/builds'))
    .command('images', 'bring all images of my account')
    .demand(1, "must provide a valid command")
    .option('token', {
        alias: 'token',
        demand: true,
        default: 'accessToken.json',
        describe: 'access token file',
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
    .argv
