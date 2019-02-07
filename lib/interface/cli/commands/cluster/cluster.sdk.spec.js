const getCmd = require('./get.cmd').toCommand();
const deleteCmd = require('./delete.cmd').toCommand();
const createCmd = require('./create.cmd').toCommand();

const request = require('requestretry');

jest.mock('../../../../logic/entities/Cluster');


const DEFAULT_RESPONSE = request.__defaultResponse();

describe('cluster commands', () => {
    beforeEach(async () => {
        request.__reset();
        request.mockClear();
        await configureSdk(); // eslint-disable-line
    });

    describe('get', () => {
        it('should handle getting all', async () => {
            const argv = {};
            const response = { statusCode: 200, body: [DEFAULT_RESPONSE.body] };
            request.__setResponse(response);
            await getCmd.handler(argv);
            await verifyResponsesReturned([response]); // eslint-disable-line
        });
    });

    describe('create', () => {
        it.skip('should skip', () => {
            // todo : test custom sdk logic
        });
    });

    describe('delete', () => {
        it('should handle deletion given name', async () => {
            const clusterName = 'some name';
            const provider = 'some provider';
            const argv = { name: clusterName };
            const responses = [
                { statusCode: 200, body: [{ _id: 'some id', selector: clusterName, provider }] },
                DEFAULT_RESPONSE,
            ];
            request.__queueResponses(responses);
            await deleteCmd.handler(argv);
            await verifyResponsesReturned(responses); // eslint-disable-line
        });

        it('should throw on cluster not found', async () => {
            const clusterName = 'some name';
            const argv = { name: clusterName };
            const response = { statusCode: 200, body: [] };
            request.__setResponse(response); // no clusters on getAll
            await expectThrows(async () => { // eslint-disable-line
                await deleteCmd.handler(argv);
            });
            await verifyResponsesReturned([response]); // eslint-disable-line
        });
    });
});
