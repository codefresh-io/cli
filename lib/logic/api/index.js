const user = require('./user');
const trigger = require('./trigger');
const pipeline = require('./pipeline');
const context = require('./context');
const image = require('./image');
const composition = require('./composition');
const environment = require('./environment');
const workflow = require('./workflow');
const log = require('./log');
const version = require('./version');
const helm = require('./helm');
const runtimeEnvironments = require('./runtimeEnvironments');
const team = require('./team');
const board = require('./board');
const section = require('./section');
const cluster = require('./cluster');
const repository = require('./repository');
const token = require('./token');
const registry = require('./registry');

module.exports = {
    user,
    trigger,
    pipeline,
    context,
    image,
    composition,
    environment,
    workflow,
    log,
    version,
    helm,
    runtimeEnvironments,
    team,
    board,
    section,
    cluster,
    repository,
    token,
    registry,
};
