const getCmd = require('./get.cmd').toCommand();
const deleteCmd = require('./delete.cmd').toCommand();
const createCmd = require('./create.cmd').toCommand();

jest.mock('../../../../logic/entities/Trigger');

const request = require('requestretry');

const DEFAULT_RESPONSE = request.__defaultResponse();

describe('trigger commands', () => {
    beforeEach(() => {
        request.__reset();
        request.mockClear();
    });

    describe('get', () => {
        it('should handle getting pipeline triggers', async () => {
            const argv = { 'event-uri': 'uri' };
            const response = { statusCode: 200, body: [DEFAULT_RESPONSE.body] };
            request.__setResponse(response);
            await getCmd.handler(argv);
            await verifyResponsesReturned([response]); // eslint-disable-line
        });

        it('should handle getting event triggers', async () => {
            const argv = { pipeline: 'pipeline' };
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
            const argv = { 'event-uri': 'uri', pipeline: 'pipeline' };
            await createCmd.handler(argv);
            await verifyResponsesReturned([DEFAULT_RESPONSE]); // eslint-disable-line
        });
    });

    describe('delete', () => {
        it('should handle deletion given name', async () => {
            const argv = { 'event-uri': 'uri', pipeline: 'pipeline' };
            await deleteCmd.handler(argv);
            await verifyResponsesReturned([DEFAULT_RESPONSE]); // eslint-disable-line
        });
    });
});
