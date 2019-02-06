const getCmd = require('./get.cmd').toCommand();
const deleteCmd = require('./delete.cmd').toCommand();
const BasePipeline = require('./run.base');
const CfPipeline = require('./run.cf');
const { positionalHandler } = require('./get.completion');

jest.mock('../../helpers/validation'); // eslint-disable-line

jest.mock('../../completion/helpers', () => { // eslint-disable-line
    return {
        authContextWrapper: func => func,
    };
});

jest.mock('../../../../logic/entities/Pipeline', () => { // eslint-disable-line
    return {
        fromResponse: res => res,
    };
});

const request = require('requestretry');

const DEFAULT_RESPONSE = request.__defaultResponse();

describe('pipeline', () => {
    beforeEach(() => {
        request.__reset();
        request.mockClear();
    });

    describe('commands', () => {
        describe('get', () => {
            it('should handle getting given id', async () => {
                const argv = { id: ['some id'] };
                await getCmd.handler(argv);
                await verifyResponsesReturned([DEFAULT_RESPONSE]); // eslint-disable-line
            });

            it('should handle getting all', async () => {
                const argv = {};
                const response = { statusCode: 200, body: { docs: [DEFAULT_RESPONSE.body] } };
                request.__setResponse(response);
                await getCmd.handler(argv);
                await verifyResponsesReturned([response]); // eslint-disable-line
            });
        });

        // decided to follow unit tests modularity concept
        describe('run', () => {
            describe('cf', () => {
                describe('preRunAll', () => {
                    it('should handle pipeline getting on pre run phase', async () => {
                        const argv = { name: 'some name' };
                        const pip = new BasePipeline(argv);
                        await pip.preRunAll();
                        await verifyResponsesReturned([DEFAULT_RESPONSE]); // eslint-disable-line
                    });

                    it('should handle context getting on pre run phase', async () => {
                        const argv = { name: 'some name', context: ['context'] };
                        const pip = new BasePipeline(argv);
                        await pip.preRunAll();
                        await verifyResponsesReturned([DEFAULT_RESPONSE, DEFAULT_RESPONSE]); // eslint-disable-line
                    });
                });

                describe('runImpl', () => {
                    it('should handle running pipeline', async () => {
                        const argv = { name: 'some name', detach: true };
                        const pip = new CfPipeline(argv);
                        await pip.runImpl({ pipelineName: argv.name, options: {} });
                        await verifyResponsesReturned([DEFAULT_RESPONSE]); // eslint-disable-line
                    });

                    it.skip('should handle showing logs', async () => {
                        const argv = { name: 'some name', detach: false }; // follow logs
                        const pip = new CfPipeline(argv);
                        await pip.runImpl();

                        // todo: test custom sdk logic

                        await verifyResponsesReturned([DEFAULT_RESPONSE, DEFAULT_RESPONSE]); // eslint-disable-line
                    });
                });
            });

            describe('local', () => {
                it.skip('should handle showing logs', () => {
                    // todo: test custom sdk logic
                });
            });
        });

        describe('delete', () => {
            it('should handle deletion given name', async () => {
                const argv = { name: 'some name' };
                await deleteCmd.handler(argv);
                await verifyResponsesReturned([DEFAULT_RESPONSE]); // eslint-disable-line
            });
        });
    });

    describe('completions', () => {
        describe('get', () => {
            it('should handle getting completion', async () => {
                const response = { statusCode: 200, body: { docs: [{ name: 'some pip' }] } };
                request.__setResponse(response);
                await positionalHandler({});
                await verifyResponsesReturned([response]); // eslint-disable-line
            });
        });
    });
});
