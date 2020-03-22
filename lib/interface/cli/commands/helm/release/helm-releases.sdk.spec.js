let deleteCmd = require('./delete-release.cmd');
let testCmd = require('./test-release.cmd');

deleteCmd.requiresAuthentication = false;
testCmd.requiresAuthentication = false;

deleteCmd = deleteCmd.toCommand();
testCmd = testCmd.toCommand();

jest.mock('../../../helpers/helm');
jest.mock('../../../helpers/logs');
jest.spyOn(process, 'exit').mockImplementation();

const request = require('requestretry');

const DEFAULT_RESPONSE = request.__defaultResponse();

describe('helm-release commands', () => {
    beforeEach(async () => {
        request.__reset();
        request.mockClear();
        await configureSdk(); // eslint-disable-line
    });

    describe('delete-release', () => {
        it('should handle deletion', async () => {
            const argv = {
                name: 'name',
                purge: true,
                noHooks: true,
                timeout: 300,
                cluster: 'cluster',
                tillerNamespace: 'tillerNamespace',
            };
            await deleteCmd.handler(argv);
            await verifyResponsesReturned([DEFAULT_RESPONSE]); // eslint-disable-line
        });
    });

    describe('test-release', () => {
        it('should handle testing', async () => {
            const argv = {
                name: 'name',
                cleanup: true,
                timeout: 300,
                cluster: 'cluster',
                tillerNamespace: 'tillerNamespace',
            };
            await testCmd.handler(argv);
            await verifyResponsesReturned([DEFAULT_RESPONSE]); // eslint-disable-line
        });
    });
});
