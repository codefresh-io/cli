const Command = require('../../Command');
const createRoot = require('../root/create.cmd');
const { sdk } = require('../../../../logic');
const { downloadSteveDore } = require('../hybrid/helper');
const { Runner, components } = require('../../../../binary');

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
        const binLocation = await downloadSteveDore();
        const componentRunner = new Runner(binLocation);
        const commands = [
            'create',
            '--c',
            contextName,
            '--token',
            context.token,
            '--api-host',
            `${context.url}/`,
            '--namespace',
            namespace,
            '--serviceaccount',
            serviceaccount,
        ];
        if (name) {
            commands.push('--name-overwrite');
            commands.push(name);
        }
        if (behindFirewall) {
            commands.push('--behind-firewall');
        }

        await componentRunner.run(components.stevedore, commands);
    },
});


module.exports = command;
