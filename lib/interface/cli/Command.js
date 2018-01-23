const yargs = require('yargs');
const CFError = require('cf-errors');
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

        this.handler = command.handler;
        this.command = command.command;
        this.aliases = command.aliases || [];

        this.webDocs = command.webDocs;
        this.description = _.get(command, 'cliDocs.description', command.description || command.desc);
        if (!this.description) {
            throw new CFError(`description field is missing for command: ${JSON.stringify(command, 2, 4)}`);
        }
        if (!this.description.endsWith('.')) {
            this.description += '.';
        }

        this.usage = command.usage || '';
        // TODO uncomment this
        // if (!this.usage) {
        //     throw new CFError(`usage field is missing for command: ${JSON.stringify(command, 2, 4)}`);
        // }
        if (!this.usage.endsWith('.') && this.usage) {
            this.usage += '.';
        }

        this.subCommands = [];
        if (command.parent) {
            this.setParentCommand(command.parent);
        }

        this.builders = [];
        this.addBuilder(this._createUsageBuilder.bind(this));

        (_.isUndefined(command.handler)) ? command.handler = (args) => {
            printError(`Error: unknown command "${args._[args._.length - 1]}"\n` +
                'Run \'codefresh --help\' for usage.');

        } : _.noop();
        (_.isUndefined(command.builder)) ? _.noop() :
            this.addBuilder(command.builder);
    }

    _createBuilderFunction() {
        const builder = (yargs) => {
            _.forEach(this.builders, (builder) => {
                builder(yargs);
            });

            _.forEach(this.subCommands, (subCommand) => {
                if (!subCommand.hasOwnProperty('requiresAuthentication') && this.hasOwnProperty('requiresAuthentication')) {
                    subCommand.requiresAuthentication = this.requiresAuthentication;
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

        return builder;
    }

    _createUsageBuilder(yargs) {
        let baseCommandPrefix = 'codefresh';

        let parentCommand = this.getParentCommand();
        while (parentCommand) {
            baseCommandPrefix += ` ${parentCommand.command}`;
            parentCommand = parentCommand.getParentCommand();
        }

        if (this.usage) {
            yargs.usage(`Command: ${baseCommandPrefix} ${this.command}\n\nDescription:\n ${this.description}\n\n ${this.usage}`);
        } else {
            yargs.usage(`Command: ${baseCommandPrefix} ${this.command}\n\nDescription:\n ${this.description}`);
        }
    }

    prepareDocs(parentCommandExists) {
        const Mock = function () {
            this.positionals = [];
            this.options = [];

            if (!parentCommandExists) {
                this.options.push({
                    key: 'help',
                    value: {
                        describe: 'Print help information',
                    },
                });
            }

            this.examples = [];
            this.positional = (key, value) => {
                const positional = {
                    key,
                    value,
                };
                if (res.command.includes(`<${key}>`)) {
                    positional.value.required = true;
                }
                this.positionals.push(positional);
                return this;
            };
            this.option = (key, value) => {
                this.options.push({
                    key,
                    value,
                });
                return this;
            };
            this.example = (command, explanation) => {
                this.examples.push({
                    command,
                    explanation,
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

        const res = {};
        res.command = [this.command];
        _.forEach(this.aliases, (alias) => {
            res.command.push(`${alias} ${this.command.substr(this.command.indexOf(" ") + 1)}`);
        });
        res.usage = this.usage;
        res.aliases = this.aliases;

        const mock = new Mock();

        const builderFunction = this._createBuilderFunction();
        const { options, positionals, examples } = builderFunction(mock);

        let parentCommandDocs;
        if (this.getParentCommand()) {
            parentCommandDocs = this.getParentCommand()
                .prepareDocs(true);
        }

        if (parentCommandDocs) {
            for (var i = 0; i < res.command.length; i++) {
                res.command[i] = `codefresh ${parentCommandDocs.command} ${res.command[i]}`;
            }
        } else if (!parentCommandExists) {
            for (var i = 0; i < res.command.length; i++) {
                res.command[i] = `codefresh ${res.command[i]}`;
            }
        }

        const webDocs = this.webDocs;
        if (webDocs) {
            res.description = webDocs.description || this.description || '';
            res.title = webDocs.title;
            res.category = webDocs.category;
            res.header = `+++\ntitle = "${res.title}"\n+++`;
        } else {
            res.command = this.command;
        }

        res.positionals = parentCommandDocs ? parentCommandDocs.positionals || '' : '';
        _.forEach(positionals, (positional) => {
            const key = positional.key;
            let description = positional.value.describe || positional.value.description;
            if (positional.value.required) {
                description += '. `required`';
            }
            if (positional.value.choices) {
                let choicesString = '<br><br>Possible values:';
                _.forEach(positional.value.choices, (choice) => {
                    choicesString += `<br> - ${choice}`;
                });
                description += choicesString;
            }
            const defaultValue = positional.value.default || '';
            res.positionals += `${key} | ${defaultValue} | ${description}\n`;
        });

        res.options = _.get(parentCommandDocs, 'options', {});
        _.forEach(options, (option) => {
            const group = option.value.group || 'Options';
            res.options[group] = res.options[group] || '';
            const key = option.key;
            let description = option.value.describe || option.value.description;
            if (option.value.required) {
                description += '. `required`';
            }
            if (option.value.choices) {
                let choicesString = '<br><br>Possible values:';
                _.forEach(option.value.choices, (choice) => {
                    choicesString += `<br> - ${choice}`;
                });
                description += choicesString;
            }
            const defaultValue = option.value.default || '';
            res.options[group] += `--${key} | ${defaultValue} | ${description}\n`;
        });

        res.examples = '';
        _.forEach(examples, (example) => {
            res.examples += `#### ${example.explanation}\n\n\`${example.command}\`\n`;
        });

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

    toCommand() {
        const yargsCommand = {};

        yargsCommand.aliases = this.aliases;
        yargsCommand.description = this.description;
        yargsCommand.command = this.command;
        yargsCommand.builder = this._createBuilderFunction();
        yargsCommand.handler = wrapHandler(this.handler, this.requiresAuthentication);
        return yargsCommand;

    }

}


module.exports = Command;
