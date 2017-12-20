const yargs = require('yargs');
const assert = require('assert');
const _  = require('lodash');

class TopCommand {
  constructor(command){
    this.command = command;
    this.subCommands = [];
    (_.isUndefined(command.handler)) ? command.handler = (args)=>{
      console.log(`i am ${command.description}`)

    }: _.noop();
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


module.exports = TopCommand;
