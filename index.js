 #! /usr/bin/env node
 
  var yargs = require("yargs");
  console.log('yargs');
  var argv = yargs.usage("$0 command")
    .command('login' , 'login' , require('./commands/login'))
    .command('me', 'check if i am logged in')
    .command('builds' , 'bring list of current builds')
    .command('images', 'bring all images of my account')
    .demand(1, "must provide a valid command")
    .help("h")
    .alias("h", "help")
    .argv
