const debug = require('debug')('codefresh:cli:helpers:api');
const request = require('requestretry');
const _ = require('lodash');

async function getApiVersion(token) {
    const RequestOptions = {
        url: 'https://g.codefresh.io/api/user',
        headers: {
            Authorization: token,
        },
        json: true,
        maxAttempts: 3, // Retry up to 3 times
        timeout: 10000,
    };
    try {
        const res = await request(RequestOptions);
        return _.get(res, 'headers.api_version');
    } catch (error) {
        debug('Failed to get API version:', error);
        return null;
    }
}

module.exports = {
    getApiVersion,
};
