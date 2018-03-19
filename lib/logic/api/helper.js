const debug = require('debug')('codefresh:http');
const fs = require('fs');
const path = require('path');
const rp = require('request-promise');
const _ = require('lodash');
const CFError = require('cf-errors');
const { printError } = require('../../interface/cli/helpers/general');

const { version } = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../../package.json')));

const sendHttpRequest = async (httpOptions, authContext, throwOnUnauthorized) => {
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
            const error = new CFError({
                cause: err,
                message: 'Error: Please create or update your authentication context',
            });

            if (!throwOnUnauthorized) {
                printError(error);
                process.exit(1);
            } else {
                throw error;
            }
        }
        if (_.isEqual(err.statusCode, 403)) {
            printError(new CFError({
                cause: err,
                message: 'Error: You do not have permissions to perform this action',
            }));
            process.exit(1);
        }

        if (_.get(err, 'error.message')) {
            if (_.get(err, 'error.error')) {
                throw new Error(`message: ${err.error.message}\nerror: ${err.error.error}`);
            } else {
                throw new Error(err.error.message);
            }
        } else {
            throw err;
        }
    }
    debug('Response:\n%O', response);
    return response;
};

module.exports = {
    sendHttpRequest,
};
