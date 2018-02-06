const DEFAULTS = {
    URL: 'https://g.codefresh.io',
    CFCONFIG: `${process.env.HOME}/.cfconfig`,
    DEBUG_PATTERN: 'codefresh',
    GET_LIMIT_RESULTS: 25,
    GET_PAGINATED_PAGE: 1,
    CODEFRESH_REGISTRIES: ['r.cfcr.io'],
    WATCH_INTERVAL_MS: 3000,
    MAX_CONSECUTIVE_ERRORS_LIMIT: 10,
};

module.exports = DEFAULTS;
