const yargs = require('yargs');
const assert = require('assert');
const _ = require('lodash');
const { printError, wrapHandler } = require('./helpers/general');
const authManager = require('../../logic').auth.manager;


class Command {
    constructor(command) {
        this.root = command.root;
        delete command.root;
        if (command.hasOwnProperty('requiresAuthentication')) {
            this.requiresAuthentication = command.requiresAuthentication;
        }
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

        let funcs = _.map(this.builders, (b) => {
            return (yargs) => {
                b(yargs);
                _.forEach(this.subCommands, (subCommand) => {
                    if (!subCommand.hasOwnProperty('requiresAuthentication') && command.hasOwnProperty('requiresAuthentication')) {
                        subCommand.requiresAuthentication = command.requiresAuthentication;
                    } else {
                        subCommand.requiresAuthentication = true;
                    }

                    if (subCommand.isBetaCommand()) {
                        // load beta commands only if authentication exists and it is beta enabled
                        const currentContext = authManager.getCurrentContext();
                        if (currentContext && currentContext.isBetaFeatEnabled()) {
                            yargs.command(subCommand.toCommand());
                        }
                    } else {
                        yargs.command(subCommand.toCommand());
                    }
                });
                return yargs;
            };
        });

        let builder = (yargs) => {
            _.flow(funcs)(yargs);
        };

        command.builder = builder;
        command.handler = wrapHandler(command.handler, this.requiresAuthentication);
        return command;

    }

}


module.exports = Command;
