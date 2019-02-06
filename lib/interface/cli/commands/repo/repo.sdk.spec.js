const getCmd = require('./get.cmd').toCommand();
const deleteCmd = require('./delete.cmd').toCommand();
const addCmd = require('./add.cmd').toCommand();

jest.mock('../../../../logic/entities/CodefreshRepo');
jest.mock('../../../../logic/entities/GitRepo');

const request = require('requestretry');

const DEFAULT_RESPONSE = request.__defaultResponse();

describe('repo commands', () => {
    beforeEach(() => {
        request.__reset();
        request.mockClear();
    });

    describe('get', () => {
        it('should handle getting all from codefresh', async () => {
            const argv = { limit: 1 };
            const contextResponseBody = {
                spec: {
                    type: 'git',
                },
                metadata: {
                    default: true,
                    name: 'context',
                },
            };
            const responses = [
                { statusCode: 200, body: [contextResponseBody] },
                { statusCode: 200, body: [DEFAULT_RESPONSE.body] },
            ];
            request.__queueResponses(responses);
            await getCmd.handler(argv);
            await verifyResponsesReturned(responses); // eslint-disable-line
        });

        it('should handle getting all from git provider', async () => {
            const argv = { limit: 1, available: true };
            const contextResponseBody = {
                spec: {
                    type: 'git',
                },
                metadata: {
                    default: true,
                    name: 'context',
                },
            };
            const responses = [
                { statusCode: 200, body: [contextResponseBody] },
                { statusCode: 200, body: [DEFAULT_RESPONSE.body] },
            ];
            request.__queueResponses(responses);
            await getCmd.handler(argv);
            await verifyResponsesReturned(responses); // eslint-disable-line
        });
    });

    describe('add', () => {
        it('should handle adding', async () => {
            const argv = { fullname: 'owner/repo' };
            const responses = [
                { statusCode: 200, body: { provider: 'github', name: 'owner/repo' } },
                { statusCode: 404 },
                { statusCode: 200, body: [DEFAULT_RESPONSE.body] },
            ];
            request.__queueResponses(responses);
            await addCmd.handler(argv);
            await verifyResponsesReturned(responses); // eslint-disable-line
        });

        it('should handle adding when repo with such name already exist', async () => {
            const argv = { fullname: 'owner/repo' };
            const responses = [
                { statusCode: 200, body: { provider: 'github', name: 'owner/repo' } },
                { statusCode: 200, body: [DEFAULT_RESPONSE.body] },
                { statusCode: 200, body: [DEFAULT_RESPONSE.body] },
            ];
            request.__queueResponses(responses);
            await addCmd.handler(argv);
            await verifyResponsesReturned(responses); // eslint-disable-line
        });
    });

    describe('delete', () => {
        it('should handle deletion given name', async () => {
            const argv = { name_id: 'owner/repo' };
            await deleteCmd.handler(argv);
            await verifyResponsesReturned([DEFAULT_RESPONSE]); // eslint-disable-line
        });
    });
});
