const { homedir } = require('os');
const path = require('path');

const DEFAULTS = {
    URL: 'https://g.codefresh.io',
    CFCONFIG: `${process.env.HOME || process.env.USERPROFILE}/.cfconfig`,
    DEBUG_PATTERN: 'codefresh',
    GET_LIMIT_RESULTS: 25,
    GET_ALL_PIPELINES_LIMIT: 10000,
    GET_PAGINATED_PAGE: 1,
    CODEFRESH_REGISTRIES: ['r.cfcr.io', '192.168.99.100:5000'],
    WATCH_INTERVAL_MS: 3000,
    MAX_CONSECUTIVE_ERRORS_LIMIT: 10,
    CODEFRESH_PATH: path.resolve(homedir(), '.Codefresh'),
    ENGINE_IMAGE: process.env.ENGINE_IMAGE || 'codefresh/engine:master',
};

module.exports = DEFAULTS;
