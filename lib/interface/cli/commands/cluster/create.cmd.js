const Command = require('../../Command');
const createRoot = require('../root/create.cmd');
const { sdk } = require('../../../../logic');

const command = new Command({
    command: 'clusters [name]',
    aliases: ['cluster'],
    parent: createRoot,
    description: 'Create a cluster',
    webDocs: {
        category: 'Clusters',
        title: 'Create Cluster',
        weight: 100,
    },
    builder: (yargs) => {
        return yargs
            .option('kube-context', {
                describe: ' kubectl context name',
                alias: 'kc',
                required: true,
            })
            .option('namespace', {
                describe: 'Kubernetes namespace to use while looking for service account',
                alias: 'ns',
                default: 'default',
                required: true,
            })
            .option('serviceaccount', {
                describe: 'Kubernetes serviceaccount credentials to be added to Codefresh',
                alias: 'sa',
                default: 'default',
                required: true,
            })
            .option('behind-firewall', {
                describe: 'Specify if the cluster is set behind a firewall',
                default: false,
                type: 'boolean',
            })
            .example('codefresh create cluster --kube-context production', 'Creating a cluster in codefresh');
    },
    handler: async (argv) => {
        const { context } = sdk.config;
        const {
            namespace,
            serviceaccount,
            'kube-context': contextName,
            'behind-firewall': behindFirewall,
            name,
        } = argv;
        let {
            terminateProcess,
        } = argv;
        if (terminateProcess === undefined) {
            terminateProcess = true;
        }
        await sdk.clusters.create({
            contextName,
            context,
            namespace,
            serviceaccount,
            behindFirewall,
            name,
            terminateProcess,
        });
    },
});


module.exports = command;
