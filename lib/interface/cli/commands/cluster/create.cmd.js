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
            .example('codefresh create cluster --kube-context production', 'Creating a cluster in codefresh');
    },
    handler: async (argv) => {
        const context = authManager.getCurrentContext();
        const name = argv['kube-context'];
        await cluster.createCluster({
            name,
            context,
        });
    },
});


module.exports = command;
