/* eslint-disable max-len */
const Command = require('../../Command');
const unInstallRoot = require('../root/uninstall.cmd');
const { downloadProvider } = require('../hybrid/helper');
const { Runner, components } = require('../../../../binary');


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
            choices: ['argocd-agent'],
            required: true,
        })
        .option('kube-config-path', {
            describe: 'Path to kubeconfig file (default is $HOME/.kube/config)',
        }),
    handler: async (argv) => {
        const { 'kube-config-path': kubeConfigPath, provider } = argv;

        const binLocation = await downloadProvider({ provider });
        const componentRunner = new Runner(binLocation);
        const commands = [
            'uninstall',
        ];

        if (kubeConfigPath) {
            commands.push('--kubeconfig');
            commands.push(kubeConfigPath);
        }

        await componentRunner.run(components.gitops[provider], commands);
    },
});

module.exports = unInstallAgentCmd;
