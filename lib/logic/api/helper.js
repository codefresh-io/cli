const debug = require('debug')('codefresh:http');
const rp = require('request-promise');
const _ = require('lodash');

const sendHttpRequest = async (httpOptions, authContext) => {
    let finalAuthContext;
    if (!authContext) {
        const authManager = require('../auth').manager; // eslint-disable-line
        finalAuthContext = authManager.getCurrentContext();
    } else {
        finalAuthContext = authContext;
    }

    const finalOptions = _.assignIn(httpOptions, finalAuthContext.prepareHttpOptions(), { json: true });
    debug('Sending http request:\n%O', finalOptions);
    let response;
    try {
        response = await rp(finalOptions);
    }
    catch (err) {
        if (_.isEqual(err.statusCode, 401)) {
            console.error('Unauthorized error: please insert a valid token for your context');
            process.exit(1);
        }
        if (_.isEqual(err.statusCode, 403)) {
            console.error('Forbidden error');
            process.exit(1);
        }
    }
    debug('Response:\n%O', response);
    return response;
};

module.exports = {
    sendHttpRequest,
};
