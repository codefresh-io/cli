const debug = require('debug')('codefresh:http');
const fs = require('fs');
const path = require('path');
const rp = require('request-promise');
const _ = require('lodash');
const { printError } = require('../../interface/cli/helpers/general');

const { version } = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../../package.json')));

const sendHttpRequest = async (httpOptions, authContext) => {
    let finalAuthContext;
    if (!authContext) {
        const authManager = require('../auth').manager; // eslint-disable-line
        finalAuthContext = authManager.getCurrentContext();
    } else {
        finalAuthContext = authContext;
    }

    const finalOptions = _.merge(
        httpOptions,
        finalAuthContext.prepareHttpOptions(),
        {
            json: true,
            headers: {
                'User-Agent': `codefresh-cli-v${version}`,
                'Codefresh-Agent': 'cli',
            },
        },
    );
    debug('Sending http request:\n%O', finalOptions);
    let response;
    try {
        response = await rp(finalOptions);
    } catch (err) {
        if (_.isEqual(err.statusCode, 401)) {
            printError('Unauthorized error: Please create or update your authentication context');
            throw err;

        }
        if (_.isEqual(err.statusCode, 403)) {
            printError('Forbidden error: You do not have permissions to perform this action');
            throw err;
        }

        throw err;
    }
    debug('Response:\n%O', response);
    return response;
};

module.exports = {
    sendHttpRequest,
};
