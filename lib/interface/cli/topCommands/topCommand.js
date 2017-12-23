const yargs = require('yargs');
const assert = require('assert');
const _  = require('lodash');

class TopCommand {
  constructor(command){
    this.command = command;
    this.subCommands = [];
    this.builders = [];
    (_.isUndefined(command.handler)) ? command.handler = (args)=>{
      console.log(`i am ${command.description}`)

    }: _.noop();
    (_.isUndefined(command.builder)) ? _.noop():
      this.addBuilder(command.builder);

  }
  addBuilder(b){
    this.builders.push(b);
  }
  subCommand(command){
    this.subCommands.push(command);
    return this;
  }
  toCommand(){
    let command = this.command;
    //assert(_.get(this.command, "builder", true));

    let funcs = _.map(this.builders, (b)=>{
      return (yargs)=>{
        b(yargs);
        return yargs;
      }
    });
    funcs.push(()=>{
      console.log('i am last in func');
    })
    let builder = (yargs)=>{
      _.flow(funcs)(yargs);
    }

   command.builder = builder;
   return command;

  }

}


module.exports = TopCommand;
