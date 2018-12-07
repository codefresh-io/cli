const Command = require('../../Command');
const yargs = require('yargs');

const Manager = require('../../../../logic/cli-config/Manager');
const { outputCliConfig } = require('../../helpers/cli-config');

const cliConfig = new Command({
    root: true,
    command: 'cli-config',
    description: 'Codefresh CLI configuration. Uses profiles',
    usage: 'CLI configuration is used for user-specific properties, for example pretty-print',
    category: 'cli config',
    webDocs: {
        description: 'Codefresh CLI configuration. Uses profiles',
        category: 'CLI Config',
        title: 'Show Config',
        weight: 100,
    },
    builder: (yargs) => {
        return yargs
            .option('output', {
                alias: 'o',
                describe: 'Output format',
                options: ['json', 'yaml'],
            })
            .help(false)
            .example('codefresh cli-config', 'Print configuration for current profile');
    },
    handler: async (argv) => {
        if (argv.help) {
            yargs.showHelp();
            return;
        }
        const config = Manager.config();
        console.log(`Current profile: | ${Manager.currentProfile()} |\n`);
        outputCliConfig(argv.output, config);
    },
});

module.exports = cliConfig;
