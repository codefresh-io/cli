const debug = require('debug')('codefresh:cli:create:context');
const Command = require('../../Command');
const { cluster } = require('../../../../logic').api;
const createRoot = require('../root/create.cmd');
const authManager = require('../../../../logic/auth').manager; // eslint-disable-line

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
            .option('name-overwrite', {
                describe: 'spesify under which name the cluster should be saved in Codefresh, default is the context name',
            })
            .option('behind-firewall', {
                describe: 'Spesify whenever the cluster is behined firewall',
                default: false,
                type: 'boolean',
            })
            .example('codefresh create cluster --kube-context production', 'Creating a cluster in codefresh');
    },
    handler: async (argv) => {
        const context = authManager.getCurrentContext();
        const {
            namespace,
            serviceaccount,
            'kube-context': contextName,
            'behind-firewall': behindFirewall,
            'name-overwrite': name,
        } = argv;
        await cluster.createCluster({
            contextName,
            context,
            namespace,
            serviceaccount,
            behindFirewall,
            name,
        });
    },
});


module.exports = command;
