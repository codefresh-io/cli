/**
 *  load auth context for dynamic completion
 *
 *  params are:
 *      { word, argv, option }
 *      or
 *      { word, argv }
 * */
function authContextWrapper(func) {
    return (params) => {
        const DEFAULTS = require('../defaults');
        const authManager = require('../../../logic').auth.manager;
        authManager.loadContexts(process.env.CF_API_KEY, process.env.CF_URL || DEFAULTS.URL, DEFAULTS.CFCONFIG);
        return func(params);
    };
}

/**
 * params are always { word, argv, option }
 * */
function handleOptions(options, handler) {
    return (params) => {
        if (options.includes(params.option)) {
            return handler(params);
        }
        return null;
    };
}

module.exports = {
    authContextWrapper,
    handleOptions,
};
