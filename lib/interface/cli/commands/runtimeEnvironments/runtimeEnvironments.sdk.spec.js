const getCmd = require('./get.cmd').toCommand();
const applyCmd = require('./apply.cmd').toCommand();
const diffCmd = require('./diff.cmd').toCommand();

jest.mock('../../../../logic/entities/RuntimeEnvironments');

const request = require('requestretry');

const DEFAULT_RESPONSE = request.__defaultResponse();

describe('runtime environment commands', () => {
    beforeEach(async () => {
        request.__reset();
        request.mockClear();
        await configureSdk(); // eslint-disable-line
    });

    describe('get', () => {
        it('should handle getting all for history', async () => {
            const argv = { name: 'some name', history: true };
            await getCmd.handler(argv);
            await verifyResponsesReturned([DEFAULT_RESPONSE]); // eslint-disable-line
        });

        it('should handle getting by name', async () => {
            const argv = { name: 'some name' };
            await getCmd.handler(argv);
            await verifyResponsesReturned([DEFAULT_RESPONSE]); // eslint-disable-line
        });

        it('should handle getting all', async () => {
            const argv = {};
            const response = {
                statusCode: 200,
                body: [DEFAULT_RESPONSE.body],
            };
            request.__setResponse(response);
            await getCmd.handler(argv);
            await verifyResponsesReturned([response]); // eslint-disable-line
        });
    });

    describe('apply', () => {
        it('should handle patching given name (with setting default)', async () => {
            const argv = { name: 'some name', extends: ['parent'], default: true };
            await applyCmd.handler(argv);
            await verifyResponsesReturned([DEFAULT_RESPONSE, DEFAULT_RESPONSE]); // eslint-disable-line
        });
    });

    describe('diff', () => {
        it('should handle diff given name', async () => {
            const argv = {
                'first-name': 'first name',
                'second-name': 'first name',
            };
            await diffCmd.handler(argv);
            await verifyResponsesReturned([DEFAULT_RESPONSE, DEFAULT_RESPONSE]); // eslint-disable-line
        });
    });
});
