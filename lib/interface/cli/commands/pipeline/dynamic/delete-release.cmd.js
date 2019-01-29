const Command = require('../../../Command');
const {
    deleteRelease,
} = require('./../../../../../logic/api/helm');
const { printError } = require('./../../../helpers/general');
const { log } = require('../../../../../logic').api;

const { sdk } = require('../../../../../logic');
const Workflow = require('../../../../../logic/entities/Workflow');

const install = new Command({
    root: true,
    command: 'delete-release [name]',
    description: 'Delete a helm release from a kubernetes cluster',
    webDocs: {
        category: 'Predefined Pipelines',
        title: 'Delete Helm Release',
        weight: 10,
    },
    builder: (yargs) => {
        return yargs
            .option('cluster', {
                description: 'Run on cluster',
                type: 'string',
                required: true,
            })
            .option('timeout', {
                description: 'time in seconds to wait for any individual kubernetes operation (like Jobs for hooks) (default 300)',
                default: '300',
                type: 'number',
            })
            .option('purge', {
                description: 'remove the release from the store and make its name free for later use (default true)',
                default: false,
                type: 'boolean',
            })
            .option('detach', {
                alias: 'd',
                describe: 'Run pipeline and print build ID',
            })
            .option('no-hooks', {
                description: 'prevent hooks from running during deletion',
                default: false,
                type: 'boolean',
            })
            .example('codefresh delete-release my-release --cluster my-cluster', 'Delete release "my-release" from cluster "my-cluster"');
    },
    handler: async (argv) => {
        const releaseName = argv.name;
        if (!releaseName) {
            throw new Error('Release name is required');
        }
        try {
            const workflowId = await deleteRelease({
                releaseName,
                cluster: argv.cluster,
                timeout: argv.timeout,
                purge: argv.purge,
                noHooks: argv.noHooks,
            });
            if (argv.detach) {
                console.log(workflowId);
            } else {
                await sdk.logs.showWorkflowLogs(workflowId, true);
                const json = await sdk.workflows.get({ id: workflowId });
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
        } catch (err) {
            printError(err);
            process.exit(1);
        }
    },
});

module.exports = install;
