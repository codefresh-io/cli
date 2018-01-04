const debug = require('debug')('codefresh:cli:install:helm-chart'); // eslint-disable-line
const Command = require('../../Command');
const installRoot = require('../root/install.cmd');
const {
    installChart,
} = require('./../../../../logic/api/helm');
const { printError, stopCommandExecution } = require('./../../helpers/general');


const command = new Command({
    command: 'helm-chart',
    description: 'Install helm chart',
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
            .option('values', {
                description: 'Values file to be passed to the install. Should be tyoed: helm-plain-text-values',
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
                values: argv.values,
                tillerNamespace: argv.tillerNamespace,
            });
            console.log(`Started with id: ${workflowId}`);
        } catch (err) {
            printError(err);
            stopCommandExecution();
        }
    },
});
installRoot.subCommand(command);


module.exports = command;

