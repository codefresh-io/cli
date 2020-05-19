const _ = require('lodash');
const request = require('requestretry');
const sdk = require('./lib/logic/sdk');
const { Config } = require('codefresh-sdk');
const openapi = require('./openapi');

jest.mock('./lib/output/Output');
jest.mock('codefresh-sdk/helpers/whoami');

let SDK_CONFIGURED;

global.verifyResponsesReturned = async (responses) => {
    const { results } = request.mock;
    let returnedResponses = _.map(results, r => r.value);
    returnedResponses = await Promise.all(returnedResponses);
    expect(returnedResponses).toEqual(responses);
};

/**
 * downloads spec one time for all tests
 * */
global.configureSdk = async () => {
    if (!SDK_CONFIGURED) {
        SDK_CONFIGURED = true;
        Object.keys(sdk).forEach(key => delete sdk[key]);
        sdk.configure(await Config.load({
            url: 'http://not.needed',
            apiKey: 'not-needed',
            spec: { json: openapi },
        }));
    }
};
