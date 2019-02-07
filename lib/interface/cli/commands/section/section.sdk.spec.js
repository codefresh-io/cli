const getCmd = require('./get.cmd').toCommand();
const deleteCmd = require('./delete.cmd').toCommand();
const createCmd = require('./create.cmd').toCommand();
const applyCmd = require('./apply.cmd').toCommand();

jest.mock('../../../../logic/entities/Section');

const request = require('requestretry');

const DEFAULT_RESPONSE = request.__defaultResponse();

describe('section commands', () => {
    beforeEach(async () => {
        request.__reset();
        request.mockClear();
        await configureSdk(); // eslint-disable-line
    });

    describe('get', () => {
        it('should handle getting given id', async () => {
            const argv = { id: 'some id' };
            await getCmd.handler(argv);
            await verifyResponsesReturned([DEFAULT_RESPONSE]); // eslint-disable-line
        });

        it('should handle getting given name and board id', async () => {
            const argv = { name: 'some name', boardId: 'board id' };
            await getCmd.handler(argv);
            await verifyResponsesReturned([DEFAULT_RESPONSE]); // eslint-disable-line
        });

        it('should handle getting given name and board name', async () => {
            const argv = { name: 'some name', boardName: 'board name' };
            const responses = [
                { statusCode: 200, body: { _id: 'board id' } },
                DEFAULT_RESPONSE,
            ];
            request.__queueResponses(responses);
            await getCmd.handler(argv);
            await verifyResponsesReturned(responses); // eslint-disable-line
        });

        it('should handle getting all by board id', async () => {
            const argv = { boardId: 'board id' };
            const response = { statusCode: 200, body: [DEFAULT_RESPONSE.body] };
            request.__setResponse(response);
            await getCmd.handler(argv);
            await verifyResponsesReturned([response]); // eslint-disable-line
        });

        it('should handle getting all by board name', async () => {
            const argv = { boardName: 'board name' };
            const responses = [
                { statusCode: 200, body: { _id: 'board id' } },
                { statusCode: 200, body: [DEFAULT_RESPONSE.body] },
            ];
            request.__queueResponses(responses);
            await getCmd.handler(argv);
            await verifyResponsesReturned(responses); // eslint-disable-line
        });
    });

    describe('create', () => {
        it('should handle creation given board id', async () => {
            const argv = { boardId: 'board id' };
            await createCmd.handler(argv);
            await verifyResponsesReturned([DEFAULT_RESPONSE]); // eslint-disable-line
        });

        it('should handle creation given board name', async () => {
            const argv = { boardName: 'board name' };
            const responses = [
                { statusCode: 200, body: { _id: 'board id' } },
                DEFAULT_RESPONSE,
            ];
            request.__queueResponses(responses);
            await createCmd.handler(argv);
            await verifyResponsesReturned(responses); // eslint-disable-line
        });
    });

    describe('apply', () => {
        it('should handle patching by id', async () => {
            const argv = { id: 'section id' };
            await applyCmd.handler(argv);
            await verifyResponsesReturned([DEFAULT_RESPONSE]); // eslint-disable-line
        });

        it('should handle patching by name and board id', async () => {
            const argv = { boardId: 'board id', name: 'section name' };
            const responses = [
                { statusCode: 200, body: { _id: 'section id' } },
                DEFAULT_RESPONSE,
            ];
            request.__queueResponses(responses);
            await applyCmd.handler(argv);
            await verifyResponsesReturned(responses); // eslint-disable-line
        });

        it('should handle patching by name and board name', async () => {
            const argv = { boardName: 'board id', name: 'section name' };
            const responses = [
                { statusCode: 200, body: { _id: 'board id' } },
                { statusCode: 200, body: { _id: 'section id' } },
                DEFAULT_RESPONSE,
            ];
            request.__queueResponses(responses);
            await applyCmd.handler(argv);
            await verifyResponsesReturned(responses); // eslint-disable-line
        });
    });

    describe('delete', () => {
        it('should handle deleting by id', async () => {
            const argv = { id: 'section id' };
            await deleteCmd.handler(argv);
            await verifyResponsesReturned([DEFAULT_RESPONSE]); // eslint-disable-line
        });

        it('should handle deleting by name and board id', async () => {
            const argv = { boardId: 'board id', name: 'section name' };
            const responses = [
                { statusCode: 200, body: { _id: 'section id' } },
                DEFAULT_RESPONSE,
            ];
            request.__queueResponses(responses);
            await deleteCmd.handler(argv);
            await verifyResponsesReturned(responses); // eslint-disable-line
        });

        it('should handle deleting by name and board name', async () => {
            const argv = { boardName: 'board id', name: 'section name' };
            const responses = [
                { statusCode: 200, body: { _id: 'board id' } },
                { statusCode: 200, body: { _id: 'section id' } },
                DEFAULT_RESPONSE,
            ];
            request.__queueResponses(responses);
            await deleteCmd.handler(argv);
            await verifyResponsesReturned(responses); // eslint-disable-line
        });
    });
});
