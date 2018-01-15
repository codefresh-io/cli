const Command = require('../../../Command');
const {
    deleteRelease,
} = require('./../../../../../logic/api/helm');
const { printError } = require('./../../../helpers/general');
const { log, workflow } = require('../../../../../logic').api;

const install = new Command({
    root: true,
    command: 'delete-release [name]',
    cliDocs: {
        description: 'Delete helm release',
    },
    webDocs: {
        category: 'Predefined Pipelines',
        title: 'Delete helm release',
    },
    builder: (yargs) => {
        return yargs
            .usage('Delete helm release from kubernetes cluster')
            .example('$0 delete-release my-release --cluster my-cluster', 'Delete release "my-release" from cluster "my-cluster"')
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
            });
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
                await log.showWorkflowLogs(workflowId, true);
                const workflowInstance = await workflow.getWorkflowById(workflowId);
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
