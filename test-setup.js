const sdk = require('./lib/logic/sdk');
const openapi = require('./openapi');
const Output = require('./lib/output/Output');
const _ = require('lodash');
const request = require('requestretry');

jest.mock('./lib/output/Output');

sdk.configure({
    url: 'http://not.needed',
    spec: openapi,
    apiKey: 'not-needed',
});

class NotThrownError extends Error {
}

global.verifyResponsesReturned = async (responses) => {
    const { results } = request.mock;
    let returnedResponses = _.map(results, r => r.value);
    returnedResponses = await Promise.all(returnedResponses);
    expect(returnedResponses).toEqual(responses);
};

global.expectThrows = async (func, ExpectedError) => {
    try {
        await func();
        throw new NotThrownError('Expected error not thrown!');
    } catch (e) {
        if (e instanceof NotThrownError) {
            throw e;
        }
        if (ExpectedError && !(e instanceof ExpectedError)) {
            throw e;
        }
        return e;
    }
};
