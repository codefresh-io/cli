const Command = require('../../../Command');
const cliCommand = require('../cli-config.cmd');

const manager = require('../../../../../logic/cli-config/manager');
const { printProperties, outputCliConfig, propertyErrorHandler } = require('../../../helpers/cli-config');

const getCommand = new Command({
    command: 'get [name]',
    parent: cliCommand,
    description: 'For current profile get all properties containing provided "name"',
    usage: 'Used when you may need to know some exact properties values',
    webDocs: {
        description: 'For current profile get all properties containing provided "name"',
        category: 'CLI Config',
        title: 'Get Config Properties',
        weight: 20,
    },
    builder: (yargs) => {
        return yargs
            .positional('name', {
                describe: 'Property name',
            })
            .example('codefresh cli-config get', 'Print available property names')
            .example('codefresh cli-config get output', 'Print properties, containing "output" word')
            .example('codefresh cli-config get output.pretty', 'Print properties, containing "output.pretty" path');
    },
    handler: async (argv) => {
        const propertyName = argv.name;
        if (!propertyName) {
            console.log('Available properties:\n');
            printProperties(manager.availableProperties());
            return;
        }

        let properties;
        try {
            properties = manager.get(propertyName);
        } catch (e) {
            propertyErrorHandler(e);
        }
        console.log(`Current profile: | ${manager.currentProfile()} |\n`);
        outputCliConfig(argv.output, properties);
    },
});

module.exports = getCommand;
