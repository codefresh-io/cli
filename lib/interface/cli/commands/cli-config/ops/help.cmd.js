const Command = require('../../../Command');
const cliCommand = require('../cli-config.cmd');
const yargs = require('yargs');

const Manager = require('../../../../../logic/cli-config/Manager');
const { outputCliMeta } = require('../../../helpers/cli-config');

const helpCommand = new Command({
    command: 'help [name]',
    parent: cliCommand,
    description: 'Show help for properties',
    usage: 'Used when you may need to know some properties types, defaults, description etc.',
    webDocs: {
        description: 'Show help for properties. Used when you may need to know some properties types, defaults, description etc.',
        category: 'CLI Config',
        title: 'Describe Config Properties',
        weight: 130,
    },
    builder: (yargs) => {
        return yargs
            .positional('name', {
                describe: 'Property name',
            })
            .example('codefresh cli-config help', 'Print help for all properties')
            .example('codefresh cli-config help output', 'Print help for properties, containing "output" word')
    },
    handler: async (argv) => {
        if (argv.help) {
            yargs.showHelp();
            return;
        }
        outputCliMeta(Manager.meta(argv.name));
    },
});

module.exports = helpCommand;
