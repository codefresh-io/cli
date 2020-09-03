/* eslint-disable max-len */
const Command = require('../../Command');
const unInstallRoot = require('../root/uninstall.cmd');
const { downloadArgo } = require('../hybrid/helper');
const { Runner, components } = require('../../../../binary');


const unInstallAgentCmd = new Command({
    root: false,
    parent: unInstallRoot,
    command: 'argocd-agent',
    description: 'Uninstall argo agent',
    webDocs: {
        category: 'Argo',
        title: 'Uninstall',
        weight: 100,
    },
    builder: yargs => yargs
        .env('CF_ARG_') // this means that every process.env.CF_ARG_* will be passed to argv
        .option('kube-context-name', {
            describe: 'Name of the kubernetes context on which argocd-agent should be uninstalled [$CF_ARG_KUBE_CONTEXT_NAME]',
        })
        .option('kube-namespace', {
            describe: 'Name of the namespace on which argocd-agent should be uninstalled [$CF_ARG_KUBE_NAMESPACE]',
        }),
    handler: async (argv) => {
        const {
            'kube-namespace': kubeNamespace,
            'kube-context-name': kubeContextName,
        } = argv;

        const binLocation = await downloadArgo();
        const componentRunner = new Runner(binLocation);

        const commands = [
            'uninstall',
        ];

        if (kubeContextName) {
            commands.push('--kube-context-name');
            commands.push(kubeContextName);
        }

        if (kubeNamespace) {
            commands.push('--kube-namespace');
            commands.push(kubeNamespace);
        }

        await componentRunner.run(components.argo, commands);
    },
});

module.exports = unInstallAgentCmd;
