const _ = require('lodash');

const DEFAULT_RESPONSE = { statusCode: 200, body: { test: 'test' } };

let RESPONSE = _.clone(DEFAULT_RESPONSE);


const request = jest.fn(async () => {
    return RESPONSE;
});

request.defaults = () => request;

request.__setResponse = (response) => {
    RESPONSE = response;
};

request.__resetResponse = () => {
    RESPONSE = _.clone(DEFAULT_RESPONSE);
};

request.__defaultResponse = () => {
    return _.clone(DEFAULT_RESPONSE);
};

module.exports = request;
