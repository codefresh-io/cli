const Command = require('../../Command');

const manager = require('../../../../logic/cli-config/manager');
const {outputCliConfig} = require('../../helpers/cli-config');

// todo : add profiles
// todo : check descriptions for docs
const cliConfig = new Command({
    root: true,
    command: 'cli-config',
    description: 'Options for codefresh cli',
    usage: 'Prints current cli-config',
    webDocs: {
        description: 'Prints current cli-config',
        category: 'CLI Config',
        title: 'CLI Config',
        weight: 20,
    },
    builder: (yargs) => {
        return yargs
            .option('output', {
                alias: 'o',
                describe: 'Output format',
                options: ['json', 'yaml'],
            });
    },
    handler: async (argv) => {
        let config;
        try {
            config = manager.config();
        } catch (e) {

            return;
        }
        console.log(`Using profile: | ${manager.profile()} |\n`);
        outputCliConfig(argv.output, config);
    },
});

module.exports = cliConfig;
