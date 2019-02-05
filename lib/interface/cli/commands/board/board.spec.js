const getCmd = require('./get.cmd').toCommand();
const deleteCmd = require('./delete.cmd').toCommand();
const createCmd = require('./create.cmd').toCommand();
const applyCmd = require('./apply.cmd').toCommand();

const request = require('requestretry');

describe('board commands', () => {
    beforeEach(() => {
        request.__resetResponse();
    });

    describe('get', () => {
        it('should handle getting given id', async () => {
            const argv = { id: 'some id' };
            await getCmd.handler(argv);
        });

        it('should handle getting given name', async () => {
            const argv = { name: 'some name' };
            await getCmd.handler(argv);
        });

        it('should handle getting all', async () => {
            const argv = {};
            request.__setResponse({ statusCode: 200, body: [] });
            await getCmd.handler(argv);
        });
    });

    describe('create', () => {
        it('should handle creation', async () => {
            const argv = { name: 'some name' };
            await createCmd.handler(argv);
        });
    });

    describe('apply', () => {
        it('should handle patching by id', async () => {
            const argv = { id: 'some id' };
            await applyCmd.handler(argv);
        });

        it('should handle patching by name', async () => {
            request.__setResponse({ statusCode: 200, body: { _id: 'some id' } });
            const argv = { name: 'some name' };
            await applyCmd.handler(argv);
        });
    });

    describe('delete', () => {
        it('should handle deletion given id', async () => {
            const argv = { id: 'some id' };
            await deleteCmd.handler(argv);
        });

        it('should handle deletion given name', async () => {
            request.__setResponse({ statusCode: 200, body: { _id: 'some id' } });
            const argv = { name: 'some name' };
            await deleteCmd.handler(argv);
        });
    });
});
