const semver = require('semver');
const { engines } = require('./package.json');

function checkVersion(version = engines.node) {
    if (!semver.satisfies(process.version, version)) {
        throw new Error(`Required node version ${version} not satisfied with current version ${process.version}.`);
    }
}
// checkVersion();

module.exports = {
    checkVersion,
};
