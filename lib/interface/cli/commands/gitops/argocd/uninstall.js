const _ = require('lodash');
const gitopsUninstaller = require('../common/uninstall');

class ArgoCDInstall {
    // eslint-disable-next-line class-methods-use-this
    async uninstall(argv) {
        const uninstallOptions = _.pick(argv, ['kube-config-path', 'kube-context-name', 'kube-namespace', 'in-cluster']);
        return gitopsUninstaller.uninstall(argv.provider, uninstallOptions);
    }
}
module.exports = new ArgoCDInstall();
