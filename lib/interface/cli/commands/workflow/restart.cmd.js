const Command = require('../../Command');
const { workflow } = require('../../../../logic/index').api;
const { log } = require('../../../../logic').api;
const { sdk } = require('../../../../logic');
const Workflow = require('../../../../logic/entities/Workflow');

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
        const workflowId = await sdk.builds.rebuild({ buildId: argv.id });
        if (argv.detach) {
            console.log(workflowId);
        } else {
            await log.showWorkflowLogs(workflowId, true);
            const json = await sdk.builds.get({ buildId: workflowId });
            const workflowInstance = Workflow.fromResponse(json);
            switch (workflowInstance.getStatus()) {
                case 'success':
                    process.exit(0);
                    break;
                case 'error':
                    process.exit(1);
                    break;
                case 'terminated':
                    process.exit(2);
                    break;
                default:
                    process.exit(100);
                    break;
            }
        }
    },
});

module.exports = restart;
