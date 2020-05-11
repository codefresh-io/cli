const Command = require('../../Command');
const yargs = require('yargs');
const _ = require('lodash');
const { sdk } = require('../../../../logic');

const denyBuildCmd = new Command({
    root: true,
    command: 'deny <buildId>',
    description: 'Deny a pending-approval workflow',
    usage: 'deny <$BUILD_ID>',
    webDocs: {
        category: 'Builds',
        title: 'Deny',
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
        await sdk.workflows.deny({ buildId });
        console.log(`Workflow ${buildId} has been denied.`);
    },
});

module.exports = denyBuildCmd;
