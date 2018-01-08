const yargs = require('yargs');
const assert = require('assert');
const _ = require('lodash');
const { printError, wrapHandler } = require('./helpers/general');
const authManager = require('../../logic').auth.manager;


class Command {
    constructor(command) {
        this.root = command.root;
        delete command.root;

        this.betaCommand = command.betaCommand || false;
        this.command = command;
        this.subCommands = [];
        this.builders = [];
        (_.isUndefined(command.handler)) ? command.handler = (args) => {
            printError(`Error: unknown command "${args._[args._.length - 1]}"\n` +
                'Run \'codefresh --help\' for usage.');

        } : _.noop();
        (_.isUndefined(command.builder)) ? _.noop() :
            this.addBuilder(command.builder);

    }

    isRoot() {
        return this.root;
    }

    isBetaCommand() {
        return this.betaCommand;
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
                    if (subCommand instanceof Command && (!subCommand.isBetaCommand() || authManager.getCurrentContext().beta)) {
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
        command.handler = wrapHandler(command.handler);
        return command;

    }

}


module.exports = Command;
