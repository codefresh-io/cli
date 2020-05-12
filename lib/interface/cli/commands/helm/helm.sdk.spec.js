let setHelmConfigCmd = require('./set-helm-config.cmd');

setHelmConfigCmd.requiresAuthentication = false;

setHelmConfigCmd = setHelmConfigCmd.toCommand();

jest.mock('../../helpers/helm');
jest.mock('../../helpers/logs');
jest.spyOn(process, 'exit').mockImplementation();

const request = require('requestretry');


jest.mock('../../../../logic', () => {
    // eslint-disable-next-line global-require
    const sdk = require('../../../../logic/sdk');
    return { sdk };
});

const DEFAULT_RESPONSE = request.__defaultResponse();

describe('helm commands', () => {
    beforeEach(async () => {
        request.__reset();
        request.mockClear();
        await configureSdk(); // eslint-disable-line
        // eslint-disable-next-line global-require
        const sdk = require('../../../../logic/sdk');
        const mockPipelinesList = jest.fn();
        mockPipelinesList.mockReturnValue(Promise.resolve([{
            metadata: {
                name: 'pip1',
                id: 'pip1',
            },
        }]));
        sdk.pipelines.getNames = mockPipelinesList;
    });

    describe('set-helm-config', () => {
        it('should set config', async () => {
            const argv = {
                cluster: 'selector',
                version: 'helm3',
                testReleasePipeline: 'pip1',
                rollbackPipeline: 'pip1',
                deleteReleasePipeline: 'pip1',
                tillerNamespace: 'kube-system',
                releaseNamespaces: ['ns1', 'ns2'],
            };
            await setHelmConfigCmd.handler(argv);
            await verifyResponsesReturned([DEFAULT_RESPONSE]); // eslint-disable-line
        });

        it('should throw error for wrong version', async () => {
            const argv = {
                cluster: 'selector',
                version: 'helm1',
            };
            try {
                await setHelmConfigCmd.handler(argv);
            } catch (error) {
                expect(error.message).toBe('Wrong version value');
            }
        });

        it('should throw error for wrong pipeline name', async () => {
            const argv = {
                cluster: 'selector',
                version: 'helm3',
                testReleasePipeline: 'pip2',
            };
            try {
                await setHelmConfigCmd.handler(argv);
            } catch (error) {
                expect(error.message).toBe('Pipeline pip2 not found');
                return;
            }
            throw new Error('should throw error for wrong pipeline name');
        });
    });
});
