const Command = require('../../Command');
const cliPackage = require('./../../../../../package.json');
const { sdk } = require('../../../../logic');
const { version } = require('../../../../logic/api');

const versionCmd = new Command({
    root: true,
    requiresAuthentication: false,
    command: 'version',
    description: 'Print version',
    webDocs: {
        title: 'version',
        weight: 90,
    },
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
                ver = await sdk.version.getServerVersion();
                ver = ver.current_commit;
                break;
            case 'hermes':
                ver = await sdk.version.getHermesVersion();
                break;
            case 'nomios':
                ver = await version.getNomiosVersion(); // todo : move to sdk
                break;
            case 'client':
            default:
                ver = cliPackage.version;
        }
        console.log(argv.component, 'version:', ver);
    },
});

module.exports = versionCmd;
