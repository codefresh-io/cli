const gitopsUpgrader = require('../common/upgrade');

class CodefreshGitopsUpgrade {
    // eslint-disable-next-line class-methods-use-this
    async upgrade(argv) {
        return gitopsUpgrader.upgrade(argv);
    }
}
module.exports = new CodefreshGitopsUpgrade();
