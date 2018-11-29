const Command = require('../../../Command');
const cliCommand = require('../cli-config.cmd');

const manager = require('../../../../../logic/cli-config/manager');
const {outputSingleOption, propertyErrorHandler, printProperties} = require('../../../helpers/cli-config');

// todo : fix descriptions for docs
// todo : value validation by schema
const getCommand = new Command({
    command: 'get [name]',
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
            });
    },
    handler: async (argv) => {
        const propertyName = argv.name;
        if (!propertyName) {
            console.log('Available properties: \n');
            printProperties(manager.availableProperties());
            return;
        }

        let config;
        try {
            config = manager.get(propertyName);
        } catch (e) {
            propertyErrorHandler(e);
            return;
        }
        console.log(`Using profile: | ${manager.profile()} |\n`);
        outputSingleOption(propertyName, config);
    },
});

module.exports = getCommand;
