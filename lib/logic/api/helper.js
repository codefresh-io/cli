const debug = require('debug')('codefresh:http');
const rp    = require('request-promise');
const _     = require('lodash');

const sendHttpRequest = async (httpOptions, authContext) => {
    let finalAuthContext;
    if (!authContext) {
        const authManager = require('../auth').manager;
        finalAuthContext  = authManager.getCurrentContext();
    } else {
        finalAuthContext = authContext;
    }

    const finalOptions = _.assignIn(httpOptions, finalAuthContext.prepareHttpOptions(), { json: true });
    debug(`Sending http request:\n%O`, finalOptions);
    const response = await rp(finalOptions);
    debug(`Response:\n%O`, response);
    return response;
};

module.exports = {
    sendHttpRequest,
};