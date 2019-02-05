const sdk = require('./lib/logic/sdk');
const openapi = require('./openapi');
const Output = require('./lib/output/Output');
const _ = require('lodash');

jest.mock('./lib/output/Output');

// mock entities
jest.mock('./lib/logic/entities/Board');
jest.mock('./lib/logic/entities/Cluster');
jest.mock('./lib/logic/entities/Composition');
jest.mock('./lib/logic/entities/Environment');

sdk.configure({
    url: 'http://not.needed',
    spec: openapi,
    apiKey: 'not-needed',
});

class NotThrownError extends Error {
}

global.expectOutputEquals = (data) => {
    expect(_.first(_.last(Output.print.mock.calls))).toEqual(data);
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
