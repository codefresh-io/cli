const Command = require('../../Command');
const yargs = require('yargs');
const _ = require('lodash');
const { sdk } = require('../../../../logic');

const approveBuildCmd = new Command({
    root: true,
    command: 'approve <buildId>',
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
                required: true,
            });
    },
    handler: async (argv) => {
        const { buildId } = argv;
        await sdk.workflows.getBuild({ buildId, noAccount: false });
        await sdk.workflows.approve({ buildId });
        console.log(`Workflow ${buildId} has been approved.`);
    },
});

module.exports = approveBuildCmd;
