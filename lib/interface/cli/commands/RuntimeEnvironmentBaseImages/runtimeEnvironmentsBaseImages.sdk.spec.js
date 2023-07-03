const getCmd = require('./get.cmd').toCommand();

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
        it('should handle getting base images', async () => {
            const argv = { name: 'some name' };
            await getCmd.handler(argv);
            await verifyResponsesReturned([DEFAULT_RESPONSE]); // eslint-disable-line
        });

        it('should throw an error for missing name', async () => {
            try {
                const argv = {};
                await getCmd.handler(argv);
            } catch (err) {
                expect(err.message).toEqual('Runtime Name must be provided');
            }
        });
    });
});
