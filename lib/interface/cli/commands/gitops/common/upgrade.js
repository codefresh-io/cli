const { downloadProvider } = require('../../hybrid/helper');
const { Runner, components } = require('../../../../../binary');
const _ = require('lodash');

class GitopsUpgrader {
    // eslint-disable-next-line class-methods-use-this
    async upgrade(argv) {
        const {
            provider,
            'kube-config-path': kubeConfigPath,
            'kube-namespace': kubeNamespace,
            'kube-context-name': kubeContextName,
            'in-cluster': inCluster,
            'bypass-download': bypassDownload,
        } = argv;

        const binLocation = await downloadProvider({ provider }, bypassDownload);
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
    }
}

module.exports = new GitopsUpgrader();
