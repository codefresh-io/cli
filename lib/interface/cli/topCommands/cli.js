
const yargs          = require('yargs');
const CFError        = require('cf-errors');
const verbs           = require('./verbs');
const auth            = require('./auth');
const { printError } = require('../helper');
const customCommands = require('../customCommands')



process.on('uncaughtException', function (err) {
    console.error('uncaughtException', err.stack);
});

process.on('unhandledRejection', error => {
    // Will print "unhandledRejection err is not defined"
    console.error('unhandledRejection', error.stack);
});

console.log(JSON.stringify(verbs.annotate));
const argv = yargs
    .env('')
  //  .command(verbs.auth.toCommand())
    .command(verbs.annotate.toCommand())
  //  .demandCommand(1, 'You need at least one command before moving on')
    .wrap(null)
    .help("help")
    .option('help ', {
        global: false,
    }).argv;
