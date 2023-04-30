const request = require('requestretry');
const _ = require('lodash');

async function getApiVersion(token) {
    const RequestOptions = {
        url: 'https://g.codefresh.io/api/user',
        headers: {
            Authorization: token,
        },
        json: true,
        // Add retry options to the RequestOptions object
        maxAttempts: 3, // Retry up to 3 times
    };
    try {
        const res = await request(RequestOptions);
        return _.get(res, 'headers.api_version');
    } catch (error) {
        return null;
    }
}

module.exports = {
    getApiVersion,
};
