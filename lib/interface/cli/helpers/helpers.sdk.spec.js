const { normalizeValues } = require('./helm');
const { validatePipelineSpec, validatePipelineYaml } = require('./validation');
const { followLogs } = require('./workflow');

jest.mock('../../../logic/entities/Context', () => {
    return {
        fromResponse: () => ({
            getType: () => 'yaml',
        }),
    };
});

const request = require('requestretry');

const DEFAULT_RESPONSE = request.__defaultResponse();

describe('helpers using sdk', () => {
    beforeEach(async () => {
        request.__reset();
        request.mockClear();
        await configureSdk(); // eslint-disable-line
    });

    describe('helm', () => {
        it('should handle getting contexts on normalizeValues', async () => {
            await normalizeValues(['context-name']);
            await verifyResponsesReturned([DEFAULT_RESPONSE]); // eslint-disable-line
        });
    });

    describe('validation', () => {
        it('should handle validation on validatePipelineSpec', async () => {
            await validatePipelineSpec({
                version: 'v1',
                spec: {},
            });
            await verifyResponsesReturned([DEFAULT_RESPONSE]); // eslint-disable-line
        });
        it('should handle validation on validatePipelineYaml', async () => {
            await validatePipelineYaml(null, 'content');
            await verifyResponsesReturned([DEFAULT_RESPONSE]); // eslint-disable-line
        });
    });

    describe('workflow', () => {
        it.skip('should handle showing logs', async () => {
            // todo: test custom sdk logic
        });
    });
});
