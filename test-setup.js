const _ = require('lodash');
const request = require('requestretry');
const sdk = require('./lib/logic/sdk');
const { loadOpenApiSpec } = require('./lib/interface/cli/helpers/openapi');

process.env.USE_MAUAL_SDK_CONFIG = 'true';
jest.mock('./lib/output/Output'); // eslint

let DOWNLOADED_SPEC;

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
    if (!DOWNLOADED_SPEC) {
        DOWNLOADED_SPEC = await loadOpenApiSpec({ useCache: true });
    }

    sdk.configure({
        url: 'http://not.needed',
        spec: DOWNLOADED_SPEC,
        apiKey: 'not-needed',
    });
};
