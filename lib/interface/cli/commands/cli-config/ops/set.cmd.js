const Command = require('../../../Command');
const cliCommand = require('../cli-config.cmd');

const manager = require('../../../../../logic/cli-config/manager');
const {outputSingleOption, propertyErrorHandler, printProperties} = require('../../../helpers/cli-config');

// todo : fix descriptions for docs
const setCommand = new Command({
    command: 'set [name]',
    parent: cliCommand,
    description: 'Options for codefresh cli',
    usage: 'Prints current cli-config',
    webDocs: {
        description: 'Create a resource from a file, directory or url',
        category: 'Operate On Resources',
        title: 'CLI Config',
        weight: 20,
    },
    builder: (yargs) => {
        return yargs
            .positional('name', {
                describe: 'Property name',
            })
            .positional('value', {
                describe: 'Property name',
            });
    },
    handler: async (argv) => {
        const { propertyName, value } = argv;
        if (!propertyName) {
            console.log('Available properties: \n');
            printProperties(manager.availableProperties());
            return;
        }

        try {
            manager.set(propertyName, value);
        } catch (e) {
            propertyErrorHandler(e);
            return;
        }
        console.log(`Property set on profile: | ${manager.profile()} |\n`);
        outputSingleOption(propertyName, value);
    },
});

module.exports = setCommand;
