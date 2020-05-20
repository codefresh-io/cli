const getCmd = require('./get.cmd').toCommand();
const deleteCmd = require('./delete.cmd').toCommand();
const createCmd = require('./create.cmd').toCommand();
const applyCmd = require('./apply.cmd').toCommand();


jest.mock('../../../../logic/entities/Board');

const request = require('requestretry');

const DEFAULT_RESPONSE = request.__defaultResponse();

describe('project commands', () => {
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

        it('should handle getting given name', async () => {
            const argv = { name: 'some name' };
            const res = await getCmd.handler(argv).catch(err => err);
            expect(res.message).toEqual('No projects found');
        });

        it('should handle getting all', async () => {
            const argv = {};
            const response = { statusCode: 200, body: [DEFAULT_RESPONSE.body] };
            request.__setResponse(response);
            const res = await getCmd.handler(argv).catch(err => err);
            expect(res.message).toEqual('No projects found');
        });
    });

    describe('create', () => {
        it('should handle creation', async () => {
            const argv = { name: 'some name' };
            const NOT_FOUND = { statusCode: 404 };
            const responses = [
                NOT_FOUND,
                DEFAULT_RESPONSE,
            ];
            request.__queueResponses(responses);
            await createCmd.handler(argv);
            await verifyResponsesReturned([NOT_FOUND, DEFAULT_RESPONSE]); // eslint-disable-line
        });
    });

    describe('apply', () => {
        it('should handle patching by id', async () => {
            const argv = { id: 'some id' };
            const FOUND = { statusCode: 200, body: { id: 'some id' } };
            const responses = [
                FOUND,
                DEFAULT_RESPONSE,
            ];
            request.__queueResponses(responses);
            await applyCmd.handler(argv);
            await verifyResponsesReturned(responses); // eslint-disable-line
        });

        it('should handle patching by name', async () => {
            const argv = { id: 'some name', name: 'some name' };
            const NOT_FOUND = { statusCode: 404 };
            const FOUND = { statusCode: 200, body: { id: 'some id' } };
            const responses = [
                NOT_FOUND,
                FOUND,
                DEFAULT_RESPONSE,
            ];
            request.__queueResponses(responses);
            await applyCmd.handler(argv);
            await verifyResponsesReturned(responses); // eslint-disable-line
        });
    });

    describe('delete', () => {
        it('should handle deletion given id', async () => {
            const argv = { id: 'some id' };
            const FOUND = { statusCode: 200, body: { id: 'some id' } };
            const responses = [
                FOUND,
                DEFAULT_RESPONSE,
            ];
            request.__queueResponses(responses);
            await deleteCmd.handler(argv);
            await verifyResponsesReturned(responses); // eslint-disable-line
        });

        it('should handle deletion given name', async () => {
            const argv = { id: 'some name', name: 'some name' };
            const NOT_FOUND = { statusCode: 404 };
            const FOUND = { statusCode: 200, body: { id: 'some id' } };
            const responses = [
                NOT_FOUND,
                FOUND,
                DEFAULT_RESPONSE,
            ];
            request.__queueResponses(responses);
            await deleteCmd.handler(argv);
            await verifyResponsesReturned(responses); // eslint-disable-line
        });
    });
});
