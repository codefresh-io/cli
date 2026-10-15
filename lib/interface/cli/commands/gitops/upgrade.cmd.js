const Command = require('../../Command');
const upgradeRoot = require('../root/upgrade.cmd');
const codefreshProvider = require('./codefresh/upgrade');
const argocdAgentProvider = require('./argocd/upgrade');

const PROVIDERS = {
    codefresh: codefreshProvider,
    'argocd-agent': argocdAgentProvider,
};

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
                choices: Object.keys(PROVIDERS),
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
                describe: 'Use this option if gitops provider is been updated from inside a cluster',
            })
            .example(
                'codefresh upgrade gitops argocd-agent',
                'Update gitops agent',
            );
    },
    handler: async (argv) => {
        const { provider } = argv;

        const providerInstaller = PROVIDERS[provider];
        return providerInstaller.upgrade(argv);
    },
});

module.exports = command;

