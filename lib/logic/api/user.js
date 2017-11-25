'use strict';

const rp = require('request-promise');
const _  = require('lodash');

const get = async (options, authContext) => {
    const rOptions = {
        uri: 'http://codefresh.dev/api/user',
        method: 'GET',
        json: true,
        headers: {
            'x-access-token': authContext.token
        }
    };

    return await rp(rOptions);
};


module.exports = {
    get
};