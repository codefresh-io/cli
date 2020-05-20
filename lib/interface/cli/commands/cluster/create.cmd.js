const Command = require('../../Command');
const createRoot = require('../root/create.cmd');
const { sdk } = require('../../../../logic');
const ProgressEvents = require('../../helpers/progressEvents');
const cliProgress = require('cli-progress');

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
    builder: yargs => yargs
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
        .example('codefresh create cluster --kube-context production', 'Creating a cluster in codefresh'),
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
        const events = new ProgressEvents();
        const format = 'downloading cluster installer  [{bar}] {percentage}% | {value}/{total}';
        const progressBar = new cliProgress.SingleBar(
            { stopOnComplete: true, format },
            cliProgress.Presets.shades_classic,
        );
        let clusterTotalSize;
        events.onStart((size) => {
            progressBar.start(size, 0);
            clusterTotalSize = size;
        });
        events.onProgress((progress) => {
            progressBar.update(progress);
            if (progress >= clusterTotalSize) {
                console.log('\n');
            }
        });
        return sdk.clusters.create({
            contextName,
            context,
            namespace,
            serviceaccount,
            behindFirewall,
            name,
            terminateProcess,
            events,
        });
    },
});


module.exports = command;
