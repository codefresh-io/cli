
const yargs          = require('yargs');
const CFError        = require('cf-errors');
const run            = require('./commands/pipelines');
const { printError } = require('../../helper');



process.on('uncaughtException', function (err) {
    console.error('uncaughtException', err.stack);
});

process.on('unhandledRejection', error => {
    // Will print "unhandledRejection err is not defined"
    console.error('unhandledRejection', error.stack);
});


const argv = yargs
    .env('')
    .command(run)
    .command ({
      command : "do",
      description : "do",
      handler : (argv)=>{
        console.log(`[hanlder]setting ${argv.key} to ${argv.value}`)
      },
      builder: (yargs)=>{
        yargs.command({
          description : "something",
          command : "something",
          handler:  (argv)=>{
            console.log(`[something] ${argv.test}`)
          },
          builder:  (yargs)=>{
            yargs.option('thing',{
              describe: 'Set environment variables',
              default: [],
              type : "array",
            })
          }
        }).option('test', {type:"string"});
      }
    })
  //  .demandCommand(1, 'You need at least one command before moving on')
    .wrap(null)
    .help("help")
    .option('help ', {
        global: false,
    })//.argv;

    console.log(argv);
