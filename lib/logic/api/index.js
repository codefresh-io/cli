const user = require('./user');
const trigger = require('./trigger');
const image = require('./image');
const composition = require('./composition');
const environment = require('./environment');
const version = require('./version');
const helm = require('./helm');
const runtimeEnvironments = require('./runtimeEnvironments');
const team = require('./team');
const board = require('./board');
const section = require('./section');
const cluster = require('./cluster');
const repository = require('./repository');

module.exports = {
    user,
    trigger,
    image,
    composition,
    environment,
    version,
    helm,
    runtimeEnvironments,
    team,
    board,
    section,
    cluster,
    repository,
};
