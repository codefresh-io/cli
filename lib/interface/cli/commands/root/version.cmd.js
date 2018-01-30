const Command = require('../../Command');
const cliPackage = require('./../../../../../package.json');
const { version } = require('../../../../logic').api;

const versionCmd = new Command({
    root: true,
    requiresAuthentication: false,
    command: 'version',
    description: 'Print version',
    builder: (yargs) => {
        return yargs
            .option('component', {
                describe: 'print component version',
                alias: 'c',
                choices: ['client', 'api', 'hermes', 'nomios'],
                default: 'client',
            });
    },
    handler: async (argv) => {
        let ver = '';
        switch (argv.component) {
            case 'api':
                ver = await version.getServerVersion();
                ver = ver.current_commit;
                break;
            case 'hermes':
                ver = await version.getHermesVersion();
                break;
            case 'nomios':
                ver = await version.getNomiosVersion();
                break;
            case 'client':
            default:
                ver = cliPackage.version;
        }
        console.log(argv.component, 'version:', ver);
    },
});

module.exports = versionCmd;
