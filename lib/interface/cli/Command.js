const yargs = require('yargs');
const CFError = require('cf-errors');
const _ = require('lodash');
const { wrapHandler } = require('./helpers/general');
const Output = require('../../output/Output');
const { sdk } = require('../../logic');


class Command {
    constructor(command) {
        this.root = command.root;
        delete command.root;

        if (command.hasOwnProperty('requiresAuthentication')) {
            this.requiresAuthentication = command.requiresAuthentication;
        } else if (this.root) {
            this.requiresAuthentication = true;
        }

        this.betaCommand = command.betaCommand || false;
        this.onPremCommand = command.onPremCommand || false;

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

        if (_.isUndefined(command.handler)) {
            command.handler = (args) => {
                Output.printError(`Error: unknown command "${args._[args._.length - 1]}"\n` +
                    'Run \'codefresh --help\' for usage.');
            };
        }
        if (!_.isUndefined(command.builder)) {
            this.addBuilder(command.builder);
        }
    }

    _createBuilderFunction() {
        const builder = (yargs) => {
            _.forEach(this.builders, (builder) => {
                builder(yargs);
            });

            _.forEach(this.subCommands, (subCommand) => {
                if (!subCommand.hasOwnProperty('requiresAuthentication') && this.hasOwnProperty('requiresAuthentication')) {
                    subCommand.requiresAuthentication = this.requiresAuthentication;
                }

                if (subCommand.isBetaCommand()) {
                    // load beta commands only if authentication exists and it is beta enabled
                    const currentContext = sdk.config && sdk.config.context;
                    if (currentContext && currentContext.isBetaFeatEnabled()) {
                        yargs.command(subCommand.toCommand());
                    }
                } else if (subCommand.isOnPremCommand()) {
                    // load onPrem commands only if authentication exists and it is onPrem enabled
                    const currentContext = sdk.config && sdk.config.context;
                    if (currentContext && currentContext.isOnPremFeatEnabled()) {
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
                if (parentCommandExists && key === 'filename') {
                    return this;
                }
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
        res.usage = this.usage.replace(/\n/g, '<br>');
        res.usage = res.usage.replace(/\t/g, '<li>');
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
                res.command[i] = `${parentCommandDocs.command[0]} ${res.command[i]}`;
            }

        } else {
            for (var i = 0; i < res.command.length; i++) {
                res.command[i] = `codefresh ${res.command[i]}`;
            }
        }

        const webDocs = this.webDocs;
        if (webDocs) {
            res.description = webDocs.description || this.description || '';
            res.title = webDocs.title;
            res.category = webDocs.category;
            res.subCategory = webDocs.subCategory;
            res.weight = webDocs.weight;
            res.header = `+++\ntitle = "${res.title}"\n+++`;
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
            const alias = positional.value.alias || '';
            res.positionals += `${key} | ${alias} | ${defaultValue} | ${description}\n`;
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
            let aliases = '';
            if (option.value.alias) {
                if (_.size(option.value.alias) === 1) {
                    aliases += `-${option.value.alias}`;
                } else {
                    aliases += `--${option.value.alias}`;
                }
            }
            const defaultValue = option.value.default || '';
            res.options[group] += `--${key} | ${aliases} | ${defaultValue} | ${description}\n`;
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

    isOnPremCommand() {
        return this.onPremCommand;
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
        yargsCommand.handler = wrapHandler(this.handler || (() => yargs.showHelp()), this.requiresAuthentication);
        return yargsCommand;

    }

}


module.exports = Command;
