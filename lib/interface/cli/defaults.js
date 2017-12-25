"use strict";


const DEFAULTS = {
    URL: 'https://g.codefresh.io',
    CFCONFIG: `${process.env.HOME}/.cfconfig`,
    DEBUG_PATTERN: 'codefresh',
    GET_LIMIT_RESULTS: 25,
    GET_PAGINATED_PAGE: 1,
    CODEFRESH_REGISTRIES: ['r.cfcr.io'],
};

module.exports = DEFAULTS;