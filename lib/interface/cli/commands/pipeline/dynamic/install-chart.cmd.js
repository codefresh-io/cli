const Command = require('../../../Command');
const {
    installChart,
} = require('./../../../../../logic/api/helm');
const { printError } = require('./../../../helpers/general');
const { log } = require('../../../../../logic').api;

const { sdk } = require('../../../../../logic');
const Workflow = require('../../../../../logic/entities/Workflow');

const install = new Command({
    root: true,
    command: 'install-chart',
    description: 'Install or upgrade a Helm chart Repository flag can be either absolute url or saved repository in Codefresh',
    webDocs: {
        category: 'Predefined Pipelines',
        title: 'Install or Upgrade Helm Chart',
        weight: 20,
    },
    builder: (yargs) => {
        return yargs
            .option('cluster', {
                description: 'Install on cluster',
                type: 'string',
                required: true,
            })
            .option('namespace', {
                description: 'Install on namespace',
                default: 'default',
                type: 'string',
            })
            .option('tiller-namespace', {
                description: 'Where tiller has been installed',
                default: 'kube-system',
                type: 'string',
            })
            .option('repository', {
                description: 'Helm repository (absolute url or name of context with type help-repository)',
                type: 'string',
                default: 'https://kubernetes-charts.storage.googleapis.com',
                required: true,
            })
            .option('name', {
                description: 'Name of the chart in the repository',
                type: 'string',
                required: true,
            })
            .option('version', {
                description: 'Version of the chart in the repository',
                type: 'string',
                required: true,
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
            .option('release-name', {
                description: 'The name to set to the release',
            })
            .example('codefresh install-chart --repo https://kubernetes-charts.storage.googleapis.com', 'Install chart from public helm repo')
            .example('codefresh get ctx --type helm-repository', 'Get all helm repos')
            .example('codefresh install-chart --repo my-help-repository', 'Install chart saved repo');
    },
    handler: async (argv) => {
        try {
            const workflowId = await installChart({
                releaseName: argv.releaseName,
                cluster: argv.cluster,
                namespace: argv.namespace,
                name: argv.name,
                repository: argv.repository,
                version: argv.version,
                values: argv.context,
                tillerNamespace: argv.tillerNamespace,
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

module.exports = install;
