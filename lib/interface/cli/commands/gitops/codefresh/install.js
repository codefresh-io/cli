const gitopsInstaller = require('../common/install');

class CodefreshInstall {
    // eslint-disable-next-line class-methods-use-this
    async install(argv) {
        return gitopsInstaller.install(argv);
    }
}
module.exports = new CodefreshInstall();
