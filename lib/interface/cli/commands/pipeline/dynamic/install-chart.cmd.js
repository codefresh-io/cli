const Command = require('../../../Command');
const { followLogs } = require('./../../../helpers/workflow');
const { sdk } = require('../../../../../logic');
const { normalizeValues, normalizeSetValues } = require('../../../helpers/helm');
const Output = require('../../../../../output/Output');

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
                alias: 'c',
            })
            .option('namespace', {
                description: 'Install on namespace',
                default: 'default',
                type: 'string',
                alias: 'ns',
            })
            .option('tiller-namespace', {
                description: 'Where tiller has been installed',
                default: 'kube-system',
                type: 'string',
                alias: 'tn',
            })
            .option('repository', {
                description: 'Helm repository (absolute url or name of context with type helm-repository)',
                type: 'string',
                default: 'kubeapps',
                required: true,
                alias: 'r',
            })
            .option('name', {
                description: 'Name of the chart in the repository',
                type: 'string',
                required: true,
                alias: 'n',
            })
            .option('version', {
                description: 'Version of the chart in the repository',
                type: 'string',
                required: true,
                alias: 'v',
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
            .example('codefresh install-chart --name mongodb', 'Install chart from public helm repo')
            .example('codefresh get ctx --type helm-repository', 'Get all helm repos')
            .example('codefresh install-chart --name mongodb  --repository my-help-repository', 'Install chart saved repo');
    },
    handler: async (argv) => {
        try {
            const result = await sdk.helm.charts.install({
                selector: argv.cluster,
                tillerNamespace: argv.tillerNamespace,
            }, {
                namespace: argv.namespace,
                releaseName: argv.releaseName,
                name: argv.name,
                repository: argv.repository,
                version: argv.version,
                values: await normalizeValues(argv.context),
                set: await normalizeSetValues(argv.set),
            });
            const workflowId = result.id;

            if (argv.detach) {
                console.log(workflowId);
                return;
            }
            await followLogs(workflowId);
        } catch (err) {
            Output.printError(err);
            process.exit(1);
        }
    },
});

module.exports = install;
