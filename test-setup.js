const sdk = require('./lib/logic/sdk');
const openapi = require('./openapi');

jest.mock('./lib/output/Output', () => {
    return {
        print: () => {
        },
        printError: (e) => {
            throw e;
        },
        init: () => {
        },
    };
});

sdk.configure({
    url: 'http://not.needed',
    spec: openapi,
    apiKey: 'not-needed',
});

module.exports = {};
