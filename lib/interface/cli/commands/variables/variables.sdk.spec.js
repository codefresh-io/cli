const getCmd = require('./get.cmd').toCommand();
const { sdk } = require('../../../../logic');

jest.mock('../../../../logic/entities/Workflow', () => {
    return {
        fromResponse: res => res,
    };
});

const request = require('requestretry');

const DEFAULT_RESPONSE = request.__defaultResponse();

describe('variables command', () => {
    beforeEach(async () => {
        request.__reset();
        request.mockClear();
        await configureSdk(); // eslint-disable-line
    });

    describe('get', () => {
        it('should handle getting by id', async () => {
            const argv = { id: ['some id'] };
            const response = { statusCode: 200, body: [DEFAULT_RESPONSE.body] };
            request.__setResponse(response);

            await getCmd.handler(argv);
            await verifyResponsesReturned([response]); // eslint-disable-line
        });
    });
});