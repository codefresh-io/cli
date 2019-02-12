const _ = require('lodash');
const request = require('requestretry');
const sdk = require('./lib/logic/sdk');

jest.mock('./lib/output/Output'); // eslint

let SDK_CONFIGURED;

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

/**
 * downloads spec one time for all tests
 * */
global.configureSdk = async () => {
    if (!SDK_CONFIGURED) {
        SDK_CONFIGURED = true;
        sdk.configure({
            url: 'http://not.needed',
            apiKey: 'not-needed',
            cache: {
                forceRefresh: true,
            },
        });
    }
};
