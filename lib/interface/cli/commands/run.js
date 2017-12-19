const yargs = require('yargs');
const assert = require('assert');
const _  = require('lodash');

class TopCommand {
  constructor(command){
    this.command = command;
    this.subCommands = [];
  }
  subCommand(command){
    this.subCommands.push(command);
    return this;
  }
  toCommand(){
    let command = this.command;
    assert(_.get(this.command, "builder", true));
    let builder = (yargs)=>{
    _.forEach(this.subCommands, (command)=>{
      yargs.command(command);
    })
  }
   command.builder = builder;
   return command;

  }

}

const run = new TopCommand({
  command : "run",
  desription : "top command run",
  handler : ()=>{
    console.log('run ->');
  }
})
module.exports = run;
