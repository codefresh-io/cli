/**
 *  load auth context for dynamic completion
 * */
function authContextWrapper(func) {
    return (word, argv) => {
        const DEFAULTS = require('../defaults');
        const authManager = require('../../../logic').auth.manager;
        authManager.loadContexts(process.env.CF_API_KEY, process.env.CF_URL || DEFAULTS.URL, DEFAULTS.CFCONFIG);
        return func(word, argv);
    };
}

module.exports = {
    authContextWrapper,
};
