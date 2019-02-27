const getCmd = require('./get.cmd').toCommand();
const deleteCmd = require('./delete.cmd').toCommand();
const createCmd = require('./create.cmd').toCommand();
const replaceCmd = require('./replace.cmd').toCommand();

const request = require('requestretry');

jest.mock('../../../../logic/entities/Composition');


const DEFAULT_RESPONSE = request.__defaultResponse();

describe('composition commands', () => {
    beforeEach(async () => {
        request.__reset();
        request.mockClear();
        await configureSdk(); // eslint-disable-line
    });

    describe('get', () => {
        it('should handle getting given id', async () => {
            const argv = { id: ['some id'] };
            await getCmd.handler(argv);
            await verifyResponsesReturned([DEFAULT_RESPONSE]); // eslint-disable-line
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
            const argv = { name: 'some name', variable: [] };
            await createCmd.handler(argv);
            await verifyResponsesReturned([DEFAULT_RESPONSE]); // eslint-disable-line
        });

        it('should throw on missing name', async () => {
            const argv = { variable: [] };
            await expect(createCmd.handler(argv)).rejects.toThrow();
        });
    });

    describe('replace', () => {
        it('should throw on missing name', async () => {
            const argv = { variable: [] };
            await expect(replaceCmd.handler(argv)).rejects.toThrow();
        });

        it('should handle replacing by name', async () => {
            const argv = { name: 'some name', variable: [] };
            const responses = [
                { statusCode: 200, body: { _id: 'some id' } },
                DEFAULT_RESPONSE,
            ];
            request.__queueResponses(responses);
            await replaceCmd.handler(argv);
            await verifyResponsesReturned(responses); // eslint-disable-line
        });

        it('should throw on composition not found', async () => {
            const argv = { name: 'some name', variable: [] };
            const response = { statusCode: 200, body: null };
            request.__setResponse(response);
            await expect(replaceCmd.handler(argv)).rejects.toThrow();
            await verifyResponsesReturned([response]); // eslint-disable-line
        });
    });

    describe('delete', () => {
        it('should handle deletion given name', async () => {
            const argv = { name: 'some name' };
            const responses = [
                { statusCode: 200, body: { _id: 'some id' } },
                DEFAULT_RESPONSE,
            ];
            request.__queueResponses(responses);
            await deleteCmd.handler(argv);
            await verifyResponsesReturned(responses); // eslint-disable-line
        });

        it('should throw on composition not found', async () => {
            const argv = { name: 'some name', variable: [] };
            const response = { statusCode: 200, body: null };
            request.__setResponse(response);
            await expect(deleteCmd.handler(argv)).rejects.toThrow();
            await verifyResponsesReturned([response]); // eslint-disable-line
        });
    });
});
