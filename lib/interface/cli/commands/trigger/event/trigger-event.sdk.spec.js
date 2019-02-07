const getCmd = require('./get.cmd').toCommand();
const deleteCmd = require('./delete.cmd').toCommand();
const createCmd = require('./create.cmd').toCommand();

jest.mock('../../../../../logic/entities/TriggerEvent');

const request = require('requestretry');

const DEFAULT_RESPONSE = request.__defaultResponse();

describe('trigger event commands', () => {
    beforeEach(async () => {
        request.__reset();
        request.mockClear();
        await configureSdk(); // eslint-disable-line
    });

    describe('get', () => {
        it('should handle getting by event uri', async () => {
            const argv = { 'event-uri': 'uri', context: 'context' };
            const response = { statusCode: 200, body: [DEFAULT_RESPONSE.body] };
            request.__setResponse(response);
            await getCmd.handler(argv);
            await verifyResponsesReturned([response]); // eslint-disable-line
        });

        it('should handle getting all', async () => {
            const argv = {};
            const response = { statusCode: 200, body: [DEFAULT_RESPONSE.body] };
            request.__setResponse(response);
            await getCmd.handler(argv);
            await verifyResponsesReturned([response]); // eslint-disable-line
        });
    });

    describe('create', () => {
        it('should handle creation', async () => {
            const argv = {};
            await createCmd.handler(argv);
            await verifyResponsesReturned([DEFAULT_RESPONSE]); // eslint-disable-line
        });
    });

    describe('delete', () => {
        it('should handle deletion given name', async () => {
            const argv = { 'event-uri': 'uri', context: 'context' };
            await deleteCmd.handler(argv);
            await verifyResponsesReturned([DEFAULT_RESPONSE]); // eslint-disable-line
        });
    });
});
