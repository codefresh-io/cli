const debug = require('debug')('codefresh:http');
const fs = require('fs');
const path = require('path');
const request = require('requestretry');
const _ = require('lodash');
const CFError = require('cf-errors');
const { printError, isDebug } = require('../../interface/cli/helpers/general');
const config = require('../../logic/cli-config/Manager').config();

const { version } = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../../package.json')));

const RETRY_STATUS_CODES = [502, 503, 504];
const retryOptions = {
    fullResponse: true,
    maxAttempts: config.request.maxRetries,
    retryDelay: config.request.retryDelay,
    retryStrategy: (err, response) => !isDebug() && (request.RetryStrategies.NetworkError(err) || RETRY_STATUS_CODES.includes(response.statusCode)),
};

function _makeResponseError(response) {
    return new Error(JSON.stringify(response.body || response));
}

const sendHttpRequest = async (httpOptions, { authContext, throwOnUnauthorized, timeout = 30000, maxRetries, retryDelay, retryStrategy } = {}) => {
    let finalAuthContext;
    if (!authContext) {
        const authManager = require('../auth').manager; // eslint-disable-line
        finalAuthContext = authManager.getCurrentContext();
    } else {
        finalAuthContext = authContext;
    }

    if (maxRetries) {
        retryOptions.maxAttempts = maxRetries;
    }
    if (retryDelay) {
        retryOptions.retryDelay = retryDelay;
    }
    if (retryStrategy) {
        retryOptions.retryStrategy = retryStrategy;
    }

    const finalOptions = _.merge(
        httpOptions,
        finalAuthContext.prepareHttpOptions(),
        retryOptions,
        {
            json: true,
            timeout,
            headers: {
                'User-Agent': `codefresh-cli-v${version}`,
                'Codefresh-Agent': 'cli',
            },
        },
    );
    debug('Sending http request:\n%O', finalOptions);

    // only network errors will be thrown -- no need to catch
    const response = await request(finalOptions);

    debug('Response:\n%O', response.body);

    const { statusCode } = response;

    // if for some reason request was not properly redirected (when "Location" header is lost, not usual case)
    if (statusCode >= 300 && statusCode < 400) {
        throw new CFError({
            cause: _makeResponseError(response),
            message: 'Error: Request was not properly redirected',
        });
    }
    if (statusCode === 401) {
        const error = new CFError({
            cause: _makeResponseError(response),
            message: 'Error: Please create or update your authentication context',
        });

        if (!throwOnUnauthorized) {
            printError(error);
            process.exit(1);
        } else {
            throw error;
        }
    }
    if (statusCode === 403) {
        printError(new CFError({
            cause: _makeResponseError(response),
            message: 'Error: You do not have permissions to perform this action',
        }));
        process.exit(1);
    }

    // other status codes
    if (statusCode >= 400 && statusCode < 600) {
        if (_.get(response, 'body.message')) {
            if (_.get(response, 'body.error')) {
                throw new Error(`message: ${response.body.message}\nerror: ${response.body.error}`);
            } else {
                throw new Error(response.body.message);
            }
        } else {
            throw _makeResponseError(response);
        }
    }
    return response.body;
};

module.exports = {
    sendHttpRequest,
};
