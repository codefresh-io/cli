const rp = require('request-promise');
const _  = require('lodash');

const sendHttpRequest = async (httpOptions, authContext) => {
    let finalAuthContext;
    if (!authContext) {
        const authManager = require('../auth').manager;
        finalAuthContext  = authManager.getCurrentContext();
    } else {
        finalAuthContext = authContext;
    }

    const finalOptions = _.assignIn(httpOptions, finalAuthContext.prepareHttpOptions(), { json: true });
    await rp(finalOptions);
};

module.exports = {
    sendHttpRequest,
};