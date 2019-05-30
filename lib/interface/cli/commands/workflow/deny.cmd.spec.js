let denyCmd = require('./deny.cmd');

denyCmd.requiresAuthentication = false;

denyCmd = denyCmd.toCommand();


jest.mock('../../helpers/validation', () => { // eslint-disable-line
    return {
        validatePipelineSpec: () => ({ valid: true }),
    };
});

const request = require('requestretry');

const DEFAULT_RESPONSE = request.__defaultResponse();

describe('Deny pending-approval workflow', () => {
    beforeEach(async () => {
        request.__reset();
        request.mockClear();
        await configureSdk(); // eslint-disable-line
    });

    describe('Positive', () => {
        it('should deny a pending-approval workflow', async () => {
            const argv = {
                buildId: 'buildId',
            };
            const response = { statusCode: 200, body: [DEFAULT_RESPONSE.body] };
            request.__setResponse(response);
            await denyCmd.handler(argv);
            await verifyResponsesReturned([response, response]); // eslint-disable-line
        });
    });

    describe('Negative', () => {
        it('should deny a pending-approval workflow', async () => {
            const argv = {
                buildId: 'buildId',
            };
            const response = { statusCode: 404, body: [DEFAULT_RESPONSE.body] };
            request.__setResponse(response);
            await expect(denyCmd.handler(argv)).rejects.toThrow();
        });
    });
});
