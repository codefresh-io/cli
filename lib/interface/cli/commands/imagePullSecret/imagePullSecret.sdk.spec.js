const generateCmd = require('./generate.cmd').toCommand();

const request = require('requestretry');

const DEFAULT_RESPONSE = request.__defaultResponse();

describe('image pull secret commands', () => {
    beforeEach(async () => {
        request.__reset();
        request.mockClear();
        await configureSdk(); // eslint-disable-line
    });

    describe('generate', () => {
        it('should handle generation', async () => {
            const argv = { cluster: 'cluster', namespace: 'default', registry: 'reg' };
            await generateCmd.handler(argv);
            await verifyResponsesReturned([DEFAULT_RESPONSE]); // eslint-disable-line
        });
    });
});
