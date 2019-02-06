const getCmd = require('./get.cmd').toCommand();
const deleteCmd = require('./delete.cmd').toCommand();

const request = require('requestretry');

jest.mock('../../../../logic/entities/Environment');

const DEFAULT_RESPONSE = request.__defaultResponse();

describe('cluster commands', () => {
    beforeEach(() => {
        request.__resetResponse();
    });

    describe('get', () => {
        it('should handle getting given id', async () => {
            const argv = { id: ['some id'] };
            await getCmd.handler(argv);
            expectOutputEquals([DEFAULT_RESPONSE.body]); // eslint-disable-line
        });

        it('should handle getting all', async () => {
            const argv = {};
            const testBody = ['test'];
            const response = { statusCode: 200, body: testBody };
            request.__setResponse(response);
            await getCmd.handler(argv);
            expectOutputEquals(testBody); // eslint-disable-line
        });
    });

    describe('delete', () => {
        it('should handle deletion given id', async () => {
            const argv = { id: 'some id' };
            await deleteCmd.handler(argv);
        });
    });
});
