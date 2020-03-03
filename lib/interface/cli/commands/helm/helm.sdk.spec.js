let setHelmVersionCmd = require('./set-helm-version.cmd');

setHelmVersionCmd.requiresAuthentication = false;

setHelmVersionCmd = setHelmVersionCmd.toCommand();

jest.mock('../../helpers/helm');
jest.mock('../../helpers/logs');
jest.spyOn(process, 'exit').mockImplementation();

const request = require('requestretry');

const DEFAULT_RESPONSE = request.__defaultResponse();

describe('helm commands', () => {
    beforeEach(async () => {
        request.__reset();
        request.mockClear();
        await configureSdk(); // eslint-disable-line
    });

    describe('set-helm-version', () => {

        it('should set version', async () => {
            const argv = {
                cluster: 'selector',
                version: '3',
            };
            await setHelmVersionCmd.handler(argv);
            await verifyResponsesReturned([DEFAULT_RESPONSE]); // eslint-disable-line
        });

        it('should throw error for wrong version', async () => {
            const argv = {
                cluster: 'selector',
                version: '1',
            };
            try {
                await setHelmVersionCmd.handler(argv);
            } catch (error) {
                expect(error.message).toBe('Wrong version value');
            }
        });
    });
});
