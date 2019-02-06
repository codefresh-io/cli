const getCmd = require('./get.cmd').toCommand();
const deleteCmd = require('./delete.cmd').toCommand();
const createCmd = require('./create.cmd').toCommand();

const request = require('requestretry');

jest.mock('../../../../logic/entities/Cluster');


const DEFAULT_RESPONSE = request.__defaultResponse();

describe('cluster commands', () => {
    beforeEach(() => {
        request.__resetResponse();
    });

    describe('get', () => {
        it('should handle getting all', async () => {
            const argv = {};
            const testBody = ['test'];
            const response = { statusCode: 200, body: testBody };
            request.__setResponse(response);
            await getCmd.handler(argv);
            expectOutputEquals(testBody); // eslint-disable-line
        });
    });

    describe.skip('create', () => {
        it('should skip', () => {
            // todo : test custom sdk logic
        });
    });

    describe('delete', () => {
        it('should handle deletion given name', async () => {
            const clusterName = 'some name';
            const provider = 'some provider';
            const argv = { name: clusterName };
            request.__setResponse({ statusCode: 200, body: [{ _id: 'some id', selector: clusterName, provider }] });
            await deleteCmd.handler(argv);
        });

        it('should throw on cluster not found', async () => {
            const clusterName = 'some name';
            const argv = { name: clusterName };
            request.__setResponse({ statusCode: 200, body: [] }); // no clusters on getAll
            await expectThrows(async () => { // eslint-disable-line
                await deleteCmd.handler(argv);
            });
        });
    });
});
