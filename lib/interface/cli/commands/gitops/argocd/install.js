const gitopsInstaller = require('../common/install');

class ArgoCDInstall {
    // eslint-disable-next-line class-methods-use-this
    async install(argv) {
        return gitopsInstaller.install(argv);
    }
}
module.exports = new ArgoCDInstall();
