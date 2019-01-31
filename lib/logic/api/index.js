const user = require('./user');
const image = require('./image');
const environment = require('./environment');
const version = require('./version');
const helm = require('./helm');
const runtimeEnvironments = require('./runtimeEnvironments');
const cluster = require('./cluster');
const repository = require('./repository');

module.exports = {
    user,
    image,
    environment,
    version,
    helm,
    runtimeEnvironments,
    cluster,
    repository,
};
