const Command = require('../../Command');

const manager = require('../../../../logic/cli-config/manager');
const {outputCliConfig} = require('../../helpers/cli-config');

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
        weight: 130,
    },
    builder: (yargs) => {
        return yargs
            .option('output', {
                alias: 'o',
                describe: 'Output format',
                options: ['json', 'yaml'],
            })
            .example('codefresh cli-config', 'Print configuration for current profile');
    },
    handler: async (argv) => {
        const config = manager.config();
        console.log(`Current profile: | ${manager.currentProfile()} |\n`);
        outputCliConfig(argv.output, config);
    },
});

module.exports = cliConfig;
