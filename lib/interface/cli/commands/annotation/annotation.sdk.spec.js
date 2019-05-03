const getCmd = require('./get.cmd').toCommand();
const deleteCmd = require('./delete.cmd').toCommand();
const createCmd = require('./create.cmd').toCommand();


jest.mock('../../../../logic/entities/Annotation');

const request = require('requestretry');

const DEFAULT_RESPONSE = request.__defaultResponse();

describe('annotation commands', () => {
    beforeEach(async () => {
        request.__reset();
        request.mockClear();
        await configureSdk(); // eslint-disable-line
    });

    describe('create', () => {
        it('should handle creation', async () => {
            const argv = { labels: ['some name'], 'entity-id': 'id', 'entity-type': 'image', _: [0, 0, 'key=value'] };
            await createCmd.handler(argv);
            await verifyResponsesReturned([DEFAULT_RESPONSE]); // eslint-disable-line
        });
    });

    describe('get', () => {
        it('should handle getting given id', async () => {
            const argv = { 'entity-id': 'id', 'entity-type': 'image', _: [0, 0, 'test'] };
            const response = { statusCode: 200, body: [{ key: 'test', value: 'test' }] };
            request.__setResponse(response);
            await getCmd.handler(argv);
            await verifyResponsesReturned([response]); // eslint-disable-line
        });

        it('should handle getting given name', async () => {
            const argv = { 'entity-id': 'id', 'entity-type': 'image', _: [0, 0] };
            const response = { statusCode: 200, body: [{ test: 'test' }] };
            request.__setResponse(response);
            await getCmd.handler(argv);
            await verifyResponsesReturned([response]); // eslint-disable-line
        });

        it('should handle getting all', async () => {
            const argv = { 'entity-id': 'id', 'entity-type': 'image', _: [0, 0] };
            const response = { statusCode: 200, body: [DEFAULT_RESPONSE.body] };
            request.__setResponse(response);
            await getCmd.handler(argv);
            await verifyResponsesReturned([response]); // eslint-disable-line
        });
    });

    describe('delete', () => {
        it('should handle deletion given name', async () => {
            const argv = { 'entity-id': 'id', 'entity-type': 'image', _: [0, 0, 'key'] };
            const responses = [
                DEFAULT_RESPONSE,
            ];
            request.__queueResponses(responses);
            await deleteCmd.handler(argv);
            await verifyResponsesReturned(responses); // eslint-disable-line
        });
    });
});
