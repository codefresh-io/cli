jest.mock('../../logic/api/helper', () => ({
    sendHttpRequest: jest.fn(),
}));

jest.mock('./helpers/get', () => ({
    specifyOutputForArray: jest.fn(),
}));

const { sendHttpRequest } = require('../../logic/api/helper');
const { specifyOutputForArray } = require('./helpers/get');

const genrateTests = async (testSuite) => {
    for (let j = 0; j < testSuite.length; j++) {
        describe(testSuite[j].describe,async () => {
            let tests = testSuite[j].tests;
            for (let i = 0; i < tests.length; i++) {
                let test = tests[i];
                sendHttpRequest.mockImplementation(() => test.output);
                specifyOutputForArray.mockImplementation(res => res);
                it(test.command, async () => {
                    await testSuite[j].target(test.params);
                    const mockCallsRequest = sendHttpRequest.mock.calls;
                    const mockCallsResponse = specifyOutputForArray.mock.calls;

                    expect(sendHttpRequest.mock.calls.length).toBe(test.apiCalls.length);
                    expect(checkApiCallsAndQs(mockCallsRequest)).toEqual(test.apiCalls);
                    expect(checkForOutput(mockCallsResponse)).toEqual(test.outputEntity);
                    sendHttpRequest.mockClear();
                    specifyOutputForArray.mockClear();
                });
            }
        });
    }
};


const checkApiCallsAndQs = (mockCallsRequest) => {
    let apiCalls = [];
    for (let i = 0; i < mockCallsRequest[0].length; i++) {
        let apiCall = {url : mockCallsRequest[0][i].url , qs : mockCallsRequest[0][i].qs , method: mockCallsRequest[0][i].method};
        apiCalls.push(apiCall);
    }
    return apiCalls;
};


const checkForOutput = (mockCallsResponse) => {
    let res = [];
    let objResponse = mockCallsResponse[0][1];
    for (let i = 0; i < objResponse.length; i++) {
        res.push(objResponse[i]);
    }
    return res;
};

module.exports = {
    genrateTests,
};