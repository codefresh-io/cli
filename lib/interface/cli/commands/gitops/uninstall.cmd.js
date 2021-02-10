/* eslint-disable max-len */
const Command = require('../../Command');
const unInstallRoot = require('../root/uninstall.cmd');
const { downloadProvider } = require('../hybrid/helper');
const { Runner, components } = require('../../../../binary');
const codefreshProvider = require('./codefresh/uninstall');
const argocdAgentProvider = require('./argocd/uninstall');

const PROVIDERS = {
    codefresh: codefreshProvider,
    'argocd-agent': argocdAgentProvider,
};

const unInstallAgentCmd = new Command({
    root: false,
    parent: unInstallRoot,
    command: 'gitops <provider>',
    description: 'Uninstall gitops agent',
    webDocs: {
        category: 'Gitops',
        title: 'Uninstall',
        weight: 100,
    },
    builder: yargs => yargs
        .env('CF_ARG_')
        .positional('provider', {
            describe: 'Gitops provider',
            choices: Object.keys(PROVIDERS),
            required: true,
        })
        .option('kube-config-path', {
            describe: 'Path to kubeconfig file (default is $HOME/.kube/config)',
        })
        .option('kube-context-name', {
            describe: 'Name of Kubernetes context',
        })
        .option('kube-namespace', {
            describe: 'Namespace in Kubernetes cluster',
        })
        .option('install-manifest', {
            describe: 'Url of argocd install manifest',
            default: 'https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml',
        })
        .option('in-cluster', {
            type: 'boolean',
            default: false,
            describe: 'Use this option if Argo agent is been updated from inside a cluster',
        }),
    handler: async (argv) => {
        const { provider } = argv;
        const providerInstaller = PROVIDERS[provider];
        return providerInstaller.uninstall(argv);
    },
});

module.exports = unInstallAgentCmd;
