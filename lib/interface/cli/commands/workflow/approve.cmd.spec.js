let approveCmd = require('./approve.cmd');

approveCmd.requiresAuthentication = false;

approveCmd = approveCmd.toCommand();


jest.mock('../../helpers/validation', () => { // eslint-disable-line
    return {
        validatePipelineSpec: () => ({ valid: true }),
    };
});

const request = require('requestretry');

const DEFAULT_RESPONSE = request.__defaultResponse();

describe('Approve pending-approval workflow', () => {
    beforeEach(async () => {
        request.__reset();
        request.mockClear();
        await configureSdk(); // eslint-disable-line
    });

    describe('Positive', () => {
        it('should approve a pending-approval workflow', async () => {
            const argv = {
                buildId: 'buildId',
            };
            const response = { statusCode: 200, body: [DEFAULT_RESPONSE.body] };
            request.__setResponse(response);
            await approveCmd.handler(argv);
            await verifyResponsesReturned([response, response]); // eslint-disable-line
        });
    });

    describe('Negative', () => {
        it('should approve a pending-approval workflow', async () => {
            const argv = {
                buildId: 'buildId',
            };
            const response = { statusCode: 404, body: [DEFAULT_RESPONSE.body] };
            request.__setResponse(response);
            await expect(approveCmd.handler(argv)).rejects.toThrow();
        });
    });
});
