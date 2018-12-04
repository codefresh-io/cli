const Command = require('../../../Command');
const cliCommand = require('../cli-config.cmd');

const Manager = require('../../../../../logic/cli-config/Manager');
const {outputCliConfig, propertyErrorHandler, printProperties} = require('../../../helpers/cli-config');

// todo : fix descriptions for docs
const setCommand = new Command({
    command: 'set [name] [value]',
    parent: cliCommand,
    description: 'For current profile set a property with "name"',
    webDocs: {
        description: 'For current profile set an available property',
        category: 'CLI Config',
        title: 'Set Config Property',
        weight: 110,
    },
    builder: (yargs) => {
        return yargs
            .positional('name', {
                describe: 'Property name',
            })
            .positional('value', {
                describe: 'Property value',
            })
            .example('codefresh cli-config set', 'Print available property names')
            .example('codefresh cli-config set output.pretty false', 'Set "output.pretty" property');
    },
    handler: async (argv) => {
        let { name, value } = argv;
        if (!name) {
            console.log('Available properties:\n');
            printProperties(Manager.availableProperties());
            return;
        }
        if (value === undefined) {
            console.log(`No value provided for property "${name}"`);
            return;
        }
        if (value === 'null') {
            value = null;
        }

        let props;
        try {
            Manager.set(name, value);
            Manager.persistConfig();
            props = Manager.get(name);
        } catch (e) {
            propertyErrorHandler(e);
            return;
        }
        console.log(`Property set on profile: | ${Manager.currentProfile()} |\n`);
        outputCliConfig(argv.output, props);
    },
});

module.exports = setCommand;
