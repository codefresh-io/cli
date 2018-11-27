const debug = require('debug')('codefresh:cli:create:context');
const Command = require('../../Command');
const fs = require('fs');
const { spawn } = require('child_process');
const rp = require('request-promise');
const { cluster } = require('../../../../logic').api;
const createRoot = require('../root/create.cmd');
const authManager = require('../../../../logic/auth').manager; // eslint-disable-line

const scriptUrl = 'https://raw.githubusercontent.com/codefresh-io/k8s-dind-config/auto_creation_cluster/codefresh-k8s-configure.sh';
const filePath = './stevedore';

const callToScript = (k8sScript) => {
    k8sScript.stdout.pipe(process.stdout);
    k8sScript.stderr.pipe(process.stderr);
    process.stdin.pipe(k8sScript.stdin);
    k8sScript.on('exit', (code) => {
        process.exit(code);
    });
};


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
            .positional('name', {
                describe: 'cluster name',
                required: true,
            })
            .example('codefresh create cluster [name]', 'Creating a cluster');
    },
    handler: async (argv) => {
        const context = authManager.getCurrentContext();
        const { name } = argv;
        await cluster.createCluster({
            name,
            context,
        });
    },
});


module.exports = command;
