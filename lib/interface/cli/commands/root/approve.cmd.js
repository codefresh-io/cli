const Command = require('../../Command');
const yargs = require('yargs');
const _ = require('lodash');
const { sdk } = require('../../../../logic');

const approveBuildCmd = new Command({
    root: true,
    command: 'approve',
    description: 'Approve a pending-approval workflow',
    usage: 'approve <$BUILD_ID>',
    webDocs: {
        category: 'Builds',
        title: 'Approve',
        weight: 100,
    },
    builder: (yargs) => {
        return yargs
            .positional('buildId', {
                describe: 'Build\'s id',
            });
    },
    handler: async (argv) => {
        if (!_.isEqual(argv._.length, 2)) {
            yargs.showHelp();
            return;
        }
        const buildId = argv._[1];
        // TODO: fix nxt line
        await sdk.workflow.approve({ buildId });
        console.log(`Build ${buildId} was approved.`);
    },
});

module.exports = approveBuildCmd;
