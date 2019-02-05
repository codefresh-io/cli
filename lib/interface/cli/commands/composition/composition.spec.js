const getCmd = require('./get.cmd').toCommand();
const deleteCmd = require('./delete.cmd').toCommand();
const createCmd = require('./create.cmd').toCommand();
const replaceCmd = require('./replace.cmd').toCommand();

const request = require('requestretry');

const DEFAULT_RESPONSE = request.__defaultResponse();

describe('composition commands', () => {
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

    describe('create', () => {
        it('should handle creation', async () => {
            const argv = { name: 'some name', variable: [] };
            await createCmd.handler(argv);
        });

        it('should throw on missing name', async () => {
            const argv = { variable: [] };
            await expectThrows(async () => { // eslint-disable-line
                await createCmd.handler(argv);
            });
        });
    });

    describe('replace', () => {
        it('should throw on missing name', async () => {
            const argv = { variable: [] };
            await expectThrows(async () => { // eslint-disable-line
                await replaceCmd.handler(argv);
            });
        });

        it('should handle replacing by name', async () => {
            const argv = { name: 'some name', variable: [] };
            request.__setResponse({ statusCode: 200, body: { _id: 'some id' } });
            await replaceCmd.handler(argv);
        });

        it('should throw on composition not found', async () => {
            const argv = { name: 'some name', variable: [] };
            request.__setResponse({ statusCode: 200, body: null });
            await expectThrows(async () => { // eslint-disable-line
                await replaceCmd.handler(argv);
            });
        });
    });

    describe('delete', () => {
        it('should handle deletion given name', async () => {
            request.__setResponse({ statusCode: 200, body: { _id: 'some id' } });
            const argv = { name: 'some name' };
            await deleteCmd.handler(argv);
        });

        it('should throw on composition not found', async () => {
            const argv = { name: 'some name', variable: [] };
            request.__setResponse({ statusCode: 200, body: null });
            await expectThrows(async () => { // eslint-disable-line
                await deleteCmd.handler(argv);
            });
        });
    });
});
