const _ = require('lodash');

const DEFAULT_RESPONSE = { statusCode: 200, body: { test: 'test' } };

let RESPONSE = _.clone(DEFAULT_RESPONSE);

let QUEUE = [];

const request = jest.fn(async () => {
    if (!_.isEmpty(QUEUE)) {
        return QUEUE.shift();
    }
    return RESPONSE;
});

request.defaults = () => request;

request.__setResponse = (response) => {
    RESPONSE = response;
};

request.__reset = () => {
    RESPONSE = _.clone(DEFAULT_RESPONSE);
    QUEUE = [];
};

request.__defaultResponse = () => {
    return _.clone(DEFAULT_RESPONSE);
};

request.__queueResponses = (queue) => {
    QUEUE = QUEUE.concat(queue);
};

module.exports = request;
