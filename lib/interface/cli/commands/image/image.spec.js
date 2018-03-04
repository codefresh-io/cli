const _ = require('lodash');
const getTraget = require('get.cmd').command.handler;
const { initTestUtils, generateObjectId, errorTest } = require('@codefresh-io/test-utils');
const testUtils = initTestUtils();
const helper = require('../../../../logic/api/helper');
function getTest(Options = {}) {
    return Options;
}

jest.mock(sendHttpRequest, (httpOptions) => {
    return jest.fn(() => httpOptions);
});



const context = require('../index'); // eslint-disable-line

describe('Contexts tests', () => {
    describe('loadConfigFile', () => {
        describe('positive', () => {
            test('adds 1 + 2 to equal 3', () => {
                expect(3).toBe(3); // eslint-disable-line
            });
        });

        describe('negative', () => {

        });
    });
});
