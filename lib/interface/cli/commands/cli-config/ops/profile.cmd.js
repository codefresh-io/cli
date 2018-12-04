const Command = require('../../../Command');
const cliCommand = require('../cli-config.cmd');

const CliConfigManager = require('../../../../../logic/cli-config/Manager');

const setCommand = new Command({
    command: 'profile [name]',
    parent: cliCommand,
    description: 'Change cli-config profile',
    usage: 'Using profiles gives an ability to switch fast between the different configuration sets',
    webDocs: {
        description: 'Change cli-config profile',
        category: 'CLI Config',
        title: 'Profiles',
        weight: 120,
    },
    builder: (yargs) => {
        return yargs
            .positional('name', {
                describe: 'Profile name',
            })
            .example('codefresh cli-config profile myProfile', 'Use or create profile with name "myProfile"');
    },
    handler: async (argv) => {
        const { name } = argv;

        if (!name) {
            console.log(`Current profile: | ${CliConfigManager.currentProfile()} |\n`);
            console.log('Available profiles:');
            CliConfigManager.profiles().forEach((profile) => {
                console.log(profile);
            });
            return;
        }

        const created = CliConfigManager.useProfile(name);
        CliConfigManager.persistConfig();

        const message = created ? `Profile "${name}" was created` : `Using profile "${name}"`;
        console.log(message);
    },
});

module.exports = setCommand;
