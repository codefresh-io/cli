const nock = require('nock');
var child = require('child_process');


const genrateTests = async (testSuite) => {
    for (let j = 0; j < testSuite.length; j++) {
        describe(testSuite[j].describe, async () => {
            let tests = testSuite[j].tests;
            for (let i = 0; i < tests.length; i++) {
                let test = tests[i];
                let mockReq = JSON.stringify(test);
                let env = Object.create( process.env);
                env.MOCK_REQUEST = mockReq;
                const mockReqObj = JSON.parse(mockReq);
                it(test.command, async () => {
                    child.exec('/Users/codefresh/Documents/cli/lib/interface/cli/codefresh ' + test.command, { env: env }, (error, stdout, stderr) => {
                        if (error) {
                            console.error('stderr', stderr);
                            throw error;
                        }
                        console.log('stdout', stdout);
                    });
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
