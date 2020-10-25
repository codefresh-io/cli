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
            .example(
                'codefresh upgrade gitops',
                'Update gitops agent',
            );
    },
    handler: async (argv) => {
        const { 'kube-config-path': kubeConfigPath, provider } = argv;
        const binLocation = await downloadProvider({ provider });
        const componentRunner = new Runner(binLocation);

        const commands = [
            'update',
        ];

        if (kubeConfigPath) {
            commands.push('--kubeconfig');
            commands.push(kubeConfigPath);
        }

        await componentRunner.run(components.gitops[provider], commands);
    },
});

module.exports = command;
