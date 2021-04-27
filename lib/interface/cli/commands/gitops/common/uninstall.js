const { downloadProvider } = require('../../hybrid/helper');
const { Runner, components } = require('../../../../../binary');
const _ = require('lodash');

class GitopsUninstaller {
    // eslint-disable-next-line class-methods-use-this
    async uninstall(provider, argv) {
        const { 'kube-config-path': kubeConfigPath, 'bypass-download': bypassDownload } = argv;
        const binLocation = await downloadProvider({ provider }, bypassDownload);
        const componentRunner = new Runner(binLocation);

        const commands = [
            'uninstall',
        ];

        if (kubeConfigPath) {
            commands.push('--kubeconfig');
            commands.push(kubeConfigPath);
        }

        const installOptions = _.omit(argv, 'kube-config-path');

        _.forEach(_.pickBy(installOptions, _.identity), (value, key) => {
            if (_.isArray(value)) {
                value.forEach((item) => {
                    commands.push(`--${key}`);
                    commands.push(item);
                });
            } else {
                commands.push(`--${key}`);
                if (value !== true) commands.push(value);
            }
        });

        await componentRunner.run(components.gitops[provider], commands);
    }
}

module.exports = new GitopsUninstaller();
