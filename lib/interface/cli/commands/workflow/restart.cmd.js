const Command = require('../../Command');
const { followLogs } = require('../../helpers/workflow');
const { sdk } = require('../../../../logic');

const restart = new Command({
    root: true,
    command: 'restart <id>',
    description: 'Restart a build by its id',
    webDocs: {
        category: 'Builds',
        title: 'Restart Build',
        weight: 30,
    },
    builder: (yargs) => {
        return yargs
            .positional('id', {
                describe: 'Build id',
            })
            .option('detach', {
                alias: 'd',
                describe: 'Run build and print workflow ID',
            })
            .example('codefresh restart ID', 'Restart build ID and attach the created new build')
            .example('codefresh restart ID -d', 'Restart build ID and return the new build id');
    },
    handler: async (argv) => {
        const workflowId = await sdk.workflows.restart({ id: argv.id });
        if (argv.detach) {
            console.log(workflowId);
            return;
        }
        await followLogs(workflowId);
    },
});

module.exports = restart;
