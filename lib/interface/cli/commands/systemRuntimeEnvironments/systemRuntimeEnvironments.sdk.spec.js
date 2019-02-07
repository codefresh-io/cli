const getCmd = require('./get.cmd').toCommand();
const applyCmd = require('./apply.cmd').toCommand();
const diffCmd = require('./diff.cmd').toCommand();
const deleteCmd = require('./delete.cmd').toCommand();

jest.mock('../../../../logic/entities/RuntimeEnvironments');

const request = require('requestretry');

const DEFAULT_RESPONSE = request.__defaultResponse();

describe('system runtime environment commands', () => {
    beforeEach(async () => {
        request.__reset();
        request.mockClear();
        await configureSdk(); // eslint-disable-line
    });

    describe('get', () => {
        it('should handle getting all account for history', async () => {
            const argv = { name: 'some name', plan: 'plan', history: true };
            await getCmd.handler(argv);
            await verifyResponsesReturned([DEFAULT_RESPONSE]); // eslint-disable-line
        });

        it('should handle getting all sys re for history', async () => {
            const argv = { name: 'system/', plan: 'plan', history: true };
            await getCmd.handler(argv);
            await verifyResponsesReturned([DEFAULT_RESPONSE]); // eslint-disable-line
        });

        it('should handle getting by name for account', async () => {
            const argv = { name: 'some name', plan: 'plan' };
            await getCmd.handler(argv);
            await verifyResponsesReturned([DEFAULT_RESPONSE]); // eslint-disable-line
        });

        it('should handle getting by name sys re', async () => {
            const argv = { name: 'system/', plan: 'plan' };
            await getCmd.handler(argv);
            await verifyResponsesReturned([DEFAULT_RESPONSE]); // eslint-disable-line
        });

        it('should handle getting all account', async () => {
            const argv = { account: true };
            const response = {
                statusCode: 200,
                body: [DEFAULT_RESPONSE.body],
            };
            request.__setResponse(response);
            await getCmd.handler(argv);
            await verifyResponsesReturned([response]); // eslint-disable-line
        });

        it('should handle getting all sys re', async () => {
            const argv = {};
            const response = {
                statusCode: 200,
                body: [DEFAULT_RESPONSE.body],
            };
            request.__setResponse(response);
            await getCmd.handler(argv);
            await verifyResponsesReturned([response]); // eslint-disable-line
        });
    });

    describe('apply', () => {
        it('should handle setting default for account', async () => {
            const argv = { name: 'some name', plan: 'plan', extends: ['parent'], default: true, account: true };
            await applyCmd.handler(argv);
            await verifyResponsesReturned([DEFAULT_RESPONSE]); // eslint-disable-line
        });

        it('should handle setting default sys re', async () => {
            const argv = { name: 'system/', plan: 'plan', extends: ['parent'], default: true };
            await applyCmd.handler(argv);
            await verifyResponsesReturned([DEFAULT_RESPONSE]); // eslint-disable-line
        });

        it('should handle patching given name for account', async () => {
            const argv = { name: 'some name', plan: 'plan', extends: ['parent']};
            await applyCmd.handler(argv);
            await verifyResponsesReturned([DEFAULT_RESPONSE]); // eslint-disable-line
        });

        it('should handle patching given name sys re', async () => {
            const argv = { name: 'system/', plan: 'plan', extends: ['parent']};
            await applyCmd.handler(argv);
            await verifyResponsesReturned([DEFAULT_RESPONSE]); // eslint-disable-line
        });
    });

    describe('delete', () => {
        it('should handle deletion for account', async () => {
            const argv = { name: 'some name', plan: 'plan' };
            await deleteCmd.handler(argv);
            await verifyResponsesReturned([DEFAULT_RESPONSE]); // eslint-disable-line
        });

        it('should handle deletion', async () => {
            const argv = { name: 'system/' };
            await deleteCmd.handler(argv);
            await verifyResponsesReturned([DEFAULT_RESPONSE]); // eslint-disable-line
        });
    });

    describe('diff', () => {
        it('should handle diff given name for account', async () => {
            const argv = {
                'first-name': 'first name',
                'second-name': 'second name',
                'first-plan': 'first plan',
                'second-plan': 'second plan',
            };
            await diffCmd.handler(argv);
            await verifyResponsesReturned([DEFAULT_RESPONSE, DEFAULT_RESPONSE]); // eslint-disable-line
        });

        it('should handle diff given name sys re', async () => {
            const argv = {
                'first-name': 'system/',
                'second-name': 'system/',
            };
            await diffCmd.handler(argv);
            await verifyResponsesReturned([DEFAULT_RESPONSE, DEFAULT_RESPONSE]); // eslint-disable-line
        });
    });
});
