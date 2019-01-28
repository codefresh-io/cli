const Command = require('../../../Command');
const {
    promoteChart,
} = require('./../../../../../logic/api/helm');
const { printError } = require('./../../../helpers/general');
const { log } = require('../../../../../logic').api;

const { sdk } = require('../../../../../logic');
const Workflow = require('../../../../../logic/entities/Workflow');

const promote = new Command({
    root: true,
    command: 'helm-promotion',
    description: 'Promote a Helm release in another environment',
    webDocs: {
        category: 'Predefined Pipelines',
        title: 'Promote Helm Release',
        weight: 20,
    },
    builder: (yargs) => {
        return yargs
            .option('board', {
                description: 'Board for promotion',
                type: 'string',
                required: false,
            })
            .option('source', {
                description: 'Source column',
                type: 'string',
                required: false,
            })
            .option('target', {
                description: 'Target column',
                type: 'string',
                required: false,
            })
            .option('namespace', {
                description: 'Promote to namespace',
                default: 'default',
                type: 'string',
            })
            .option('source-tiller-namespace', {
                description: 'Where tiller has been installed in source cluster',
                default: 'kube-system',
                type: 'string',
            })
            .option('target-tiller-namespace', {
                description: 'Where tiller has been installed in target cluster',
                default: 'kube-system',
                type: 'string',
            })
            .option('source-release', {
                description: 'The name of source release',
            })
            .option('revision', {
                description: 'Revision of source release',
                type: 'string',
                required: false,
            })
            .option('target-release', {
                description: 'The name to set to the release',
            })
            .option('context', {
                description: 'Contexts (yaml || secret-yaml) to be passed to the install',
                array: true,
            })
            .option('set', {
                description: 'set of KEY=VALUE to be passed to the install',
                array: true,
            })
            .option('detach', {
                alias: 'd',
                describe: 'Run pipeline and print build ID',
            })
            .example(
                'codefresh helm-promotion --board app --source dev --target test --source-release application',
                `Promote 'application' release on board 'app' from 'dev' to 'test' environment`);
    },
    handler: async (argv) => {
        try {
            const workflowId = await promoteChart({
                board: argv.board,
                sourceSection: argv.source,
                targetSection: argv.target,
                sourceCluster: argv.sourceCluster,
                tillerNamespace: argv.sourceTillerNamespace,
                releaseName: argv.sourceRelease,
                revision: argv.revision,
                targetCluster: argv.targetCluster,
                targetTillerNamespace: argv.targetTillerNamespace,
                targetNamespace: argv.namespace,
                targetReleaseName: argv.targetRelease,
                values: argv.context,
                setValues: argv.set,
            });
            if (argv.detach) {
                console.log(workflowId);
            } else {
                await log.showWorkflowLogs(workflowId, true);
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

module.exports = promote;
