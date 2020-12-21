const gitopsInstaller = require('../common/install');
const argocdInstaller = require('../argocd/install');

class CodefreshInstall {
    // eslint-disable-next-line class-methods-use-this
    async install(argv) {
        await gitopsInstaller.install(argv);
        return argocdInstaller.install({
            ...argv,
            provider: 'argocd-agent',
        });
    }
}
module.exports = new CodefreshInstall();
