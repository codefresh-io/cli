const Command = require('../../Command');

const upgradeRoot = require('../root/upgrade.cmd');
const { downloadProvider } = require('../hybrid/helper');
const { Runner, components } = require('../../../../binary');

const command = new Command({
    root: false,
    parent: upgradeRoot,
    command: 'gitops <provider>',
    description: 'Upgrade gitops agent',
    webDocs: {
        category: 'Gitops',
        title: 'Upgrade',
        weight: 100,
    },
    builder: (yargs) => {
        yargs
            .positional('provider', {
                describe: 'Gitops provider',
                choices: ['argocd-agent'],
                required: true,
            })
            .option('kube-config-path', {
                describe: 'Path to kubeconfig file (default is $HOME/.kube/config)',
            })
            .option('kube-namespace', {
                describe: 'Name of the namespace on which Argo agent should be updated',
            })
            .option('kube-context-name', {
                describe: 'Name of the kubernetes context where Argo agent should be updated (default is current-context)',
            })
            .option('in-cluster', {
                type: 'boolean',
                default: false,
                describe: 'Use this option if Argo agent is been updated from inside a cluster',
            })
            .example(
                'codefresh upgrade gitops argocd-agent',
                'Update gitops agent',
            );
    },
    handler: async (argv) => {
        const {
            provider,
            'kube-config-path': kubeConfigPath,
            'kube-namespace': kubeNamespace,
            'kube-context-name': kubeContextName,
            'in-cluster': inCluster,
        } = argv;

        const binLocation = await downloadProvider({ provider });
        const componentRunner = new Runner(binLocation);

        const commands = [
            'update',
        ];

        if (kubeConfigPath) {
            commands.push('--kubeconfig');
            commands.push(kubeConfigPath);
        }
        if (kubeNamespace) {
            commands.push('--kube-namespace');
            commands.push(kubeNamespace);
        }
        if (kubeContextName) {
            commands.push('--kube-context-name');
            commands.push(kubeContextName);
        }
        if (inCluster) {
            commands.push('--in-cluster');
            commands.push('true');
        }

        await componentRunner.run(components.gitops[provider], commands);
    },
});

module.exports = command;

