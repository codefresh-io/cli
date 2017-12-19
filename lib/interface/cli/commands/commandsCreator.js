const yargs = require('yargs');
const assert = require('assert');
const _  = require('lodash');
const run = require('./run');

run.subCommand({
  command: "pipeline",
  description : "run pipeline",
  handler : ()=>{
    console.log('run pipeline ->');
  }
})
run.subCommand({
  command: "image",
  description : "run image",
  handler : ()=>{
    console.log('run image ->');
  }
})

run.subCommand({
  command: "slack",
  description : "run slack",
  handler : ()=>{
    console.log('run slack command  ->');
  },
  builder:(yargs)=>{
    yargs.options('channel', {type:"string"});
  },
  handler:(args)=>{
    console.log('slack call to channle' + args.channel);
  }
})

const argv = yargs
    .env('')
    .command(run.toCommand())

    .help("help")
    .option('help ', {
        global: false,
    }).argv;
