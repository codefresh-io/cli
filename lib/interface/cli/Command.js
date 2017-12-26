const yargs = require('yargs');
const assert = require('assert');
const _ = require('lodash');
const { wrapHandler } = require('./helpers/general');

class Command {
    constructor(command) {
        this.command = command;
        this.subCommands = [];
        this.builders = [];
        (_.isUndefined(command.handler)) ? command.handler = (args) => {
            console.log(`i am ${command.description}`);

        } : _.noop();
        (_.isUndefined(command.builder)) ? _.noop() :
            this.addBuilder(command.builder);

    }

    addBuilder(b) {
        this.builders.push(b);
    }

    subCommand(command) {
        this.subCommands.push(command);
        return this;
    }

    toCommand() {
        let command = this.command;
        //assert(_.get(this.command, "builder", true));

        let funcs = _.map(this.builders, (b) => {
            return (yargs) => {
                b(yargs);
                _.forEach(this.subCommands, (subCommand) => {
                    // TODO use .toCommand here too
                    if (subCommand instanceof Command) {
                        yargs.command(subCommand.toCommand());
                    } else {
                        yargs.command(subCommand);
                    }
                });
                return yargs;
            };
        });

        let builder = (yargs) => {
            _.flow(funcs)(yargs);
        };

        command.builder = builder;
        wrapHandler(command.handler);
        return command;

    }

}


module.exports = Command;
