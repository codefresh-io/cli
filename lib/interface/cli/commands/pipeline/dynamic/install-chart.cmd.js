const Command = require('../../../Command');
const {
    installChart,
} = require('./../../../../../logic/api/helm');
const { printError } = require('./../../../helpers/general');
const { log } = require('../../../../../logic').api;

const install = new Command({
    root: true,
    command: 'install-chart',
    cliDocs: {
        description: 'Install or upgrade Helm chart',
    },
    webDocs: {
        category: 'Predefined Pipelines',
        title: 'Install or upgrade Helm chart',
    },
    builder: (yargs) => {
        return yargs
            .usage('Install or upgrade helm chart on cluster')
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
                description: 'Helm repository',
                type: 'string',
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
            .option('release-name', {
                description: 'The name to set to the release',
            });
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
            });
            console.log(`Started with id: ${workflowId}`);
            log.showWorkflowLogs(workflowId, true);
            process.exit(0);
        } catch (err) {
            printError(err);
            process.exit(1);
        }
    },
});

module.exports = install;
