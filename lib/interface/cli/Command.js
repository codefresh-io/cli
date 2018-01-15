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
        this.rawCommand = command;
        this.yargsCommand = this.prepareYargsCommand();

        this.subCommands = [];
        if (command.parent) {
            this.setParentCommand(command.parent);
        }
        this.builders = [];
        (_.isUndefined(command.handler)) ? command.handler = (args) => {
            printError(`Error: unknown command "${args._[args._.length - 1]}"\n` +
                'Run \'codefresh --help\' for usage.');

        } : _.noop();
        (_.isUndefined(command.builder)) ? _.noop() :
            this.addBuilder(command.builder);

    }

    prepareDocs(parentCommandExists) {
        const command = this.rawCommand;

        const Mock = function () {
            this.positionals = [];
            this.options = [];
            this.positional = (key, value) => {
                this.positionals.push({
                    key,
                    value
                });
                return this;
            };
            this.option = (key, value) => {
                this.options.push({
                    key,
                    value,
                });
                return this;
            };

            for (var property in yargs) {
                if (yargs.hasOwnProperty(property)) {
                    if (typeof yargs[property] === 'function' && !this[property]) {
                        this[property] = () => {
                            return this;
                        };
                    }
                }
            }
        };

        const mock = new Mock();

        const res = {};

        const { options, positionals } = command.builder(mock);

        let parentCommandDocs;
        if (this.getParentCommand()) {
            parentCommandDocs = this.getParentCommand()
                .prepareDocs(true);
        }

        res.command = command.command;
        if (parentCommandDocs) {
            res.command = `codefresh ${parentCommandDocs.command} ${res.command}`;
        } else if (!parentCommandExists) {
            res.command = `codefresh ${res.command}`;
        }

        const webDocs = _.get(command, 'webDocs');
        if (!webDocs) {
            return;
        }
        const cliDocs = _.get(command, 'cliDocs');
        res.description = webDocs.description || cliDocs.description || '';
        res.title = webDocs.title;
        res.category = webDocs.category;
        res.header = `+++\ntitle = "${res.title}"\n+++`;

        res.positionals = '';
        _.forEach(positionals, (positional) => {
            const key = positional.key;
            const description = positional.value.describe || positional.value.description;
            const defaultValue = positional.value.default || '';
            res.positionals += `${key} | ${defaultValue} | ${description}\n`;
        });

        res.options = '';
        _.forEach(options, (option) => {
            const key = option.key;
            const description = option.value.describe || option.value.description;
            const defaultValue = option.value.default || '';
            res.options += `--${key} | ${defaultValue} | ${description}\n`;
        });

        return res;
    }

    prepareYargsCommand() {
        const command = this.rawCommand;
        const res = {
            handler: command.handler,
            builder: command.builder,
            command: command.command,
            aliases: command.aliases,
            description: _.get(command, 'cliDocs.description', command.description),
        };

        return res;
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

    setParentCommand(parentCommand) {
        this.parentCommand = parentCommand;
        this.parentCommand.subCommand(this);
        return this;
    }

    getParentCommand() {
        return this.parentCommand;
    }

    getHandler() {
        return this.rawCommand.handler;
    }

    toCommand() {
        let command = this.yargsCommand;

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
