/* eslint-disable max-len */
const Command = require('../../Command');
const deleteAgent = require('../agent/delete.cmd');
const unInstallRoot = require('../root/uninstall.cmd');
const { sdk } = require('../../../../logic');
const { getKubeContext } = require('../../helpers/kubernetes');


const unInstallAgentCmd = new Command({
    root: false,
    parent: unInstallRoot,
    command: 'agent',
    description: 'Uninstall an agent on kubernetes cluster',
    webDocs: {
        category: 'Agents',
        title: 'Uninstall',
        weight: 100,
    },
    builder: yargs => yargs
        .env('CF_ARG_') // this means that every process.env.CF_ARG_* will be passed to argv
        .option('name', {
            describe: 'Agent\'s name to be uninstalled',
        })
        .option('kube-context-name', {
            describe: 'Name of the kubernetes context on which venona should be uninstalled [$CF_ARG_KUBE_CONTEXT_NAME]',
        })
        .option('kube-namespace', {
            describe: 'Name of the namespace on which venona should be uninstalled [$CF_ARG_KUBE_NAMESPACE]',
        })
        .option('kube-config-path', {
            describe: 'Path to kubeconfig file (default is $HOME/.kube/config)',
        })
        .option('verbose', {
            describe: 'Print logs',
        }),
    handler: async (argv) => {
        const {
            name,
            'kube-namespace': kubeNamespace,
            'kube-config-path': kubeConfigPath,

        } = argv;

        let { 'kube-context-name': kubeContextName } = argv;

        if (!kubeContextName) {
            kubeContextName = getKubeContext(kubeConfigPath);
        }

        if (!name) {
            throw new Error('Name is a mandatory parameter');
        }


        await sdk.agents.unInstall({
            name,
            kubeContextName,
            kubeNamespace,
            terminateProcess: false,
        });
        await deleteAgent.handler({ name, id: name });
        process.exit(0);
    },
});

module.exports = unInstallAgentCmd;
