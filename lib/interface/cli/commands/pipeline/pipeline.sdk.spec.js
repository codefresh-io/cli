const yaml = require('js-yaml');
const request = require('requestretry');
const fs = require('fs');
const DEFAULTS = require('../../defaults');
const getCmd = require('./get.cmd').toCommand();
const deleteCmd = require('./delete.cmd').toCommand();
const BasePipeline = require('./run.base');
const CfPipeline = require('./run.cf');
const { positionalHandler } = require('./get.completion');
const { sdk } = require('../../../../logic');

jest.mock('../../helpers/validation'); // eslint-disable-line
jest.mock('../../../../../check-version');
jest.mock('../../completion/helpers', () => { // eslint-disable-line
    return {
        authContextWrapper: (func) => func,
    };
});

jest.mock('../../../../logic/entities/Pipeline', () => { // eslint-disable-line
    return {
        fromResponse: (res) => res,
    };
});

const DEFAULT_RESPONSE = request.__defaultResponse();

describe('pipeline', () => {
    beforeEach(async () => {
        request.__reset();
        request.mockClear();
        await configureSdk(); // eslint-disable-line
    });

    describe('commands', () => {
        describe('get', () => {
            const { _getLimit } = require('./get.cmd');
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

            it('should return limit from arg', async () => {
                expect(_getLimit(10, true)).toEqual(10);
            });

            it('should return zero limit', async () => {
                expect(_getLimit(0, true)).toEqual(0);
            });

            it('should return default limit', async () => {
                expect(_getLimit(undefined, false)).toEqual(DEFAULTS.GET_LIMIT_RESULTS);
            });

            it('should return `unlimited` value', async () => {
                expect(_getLimit(undefined, true)).toEqual(DEFAULTS.GET_ALL_PIPELINES_LIMIT);
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

                describe('run', () => {
                    it('should handle running pipeline with encrypted variables', async () => {
                        const argv = { name: 'some name',
                            detach: true,
                            annotation: [],
                            variable:
                                [{
                                    key: 'secret',
                                    value: 'secret',
                                },
                                {
                                    key: 'VAR1',
                                    value: 'VAL1',
                                },
                                ],
                            encrypted: ['secret'],
                        };
                        const pip = new CfPipeline(argv);
                        await pip.run();
                        expect(pip.executionRequests[0].options.variables).toEqual([
                            {
                                key: 'secret',
                                value: 'secret',
                                encrypted: true,
                            },
                            {
                                key: 'VAR1',
                                value: 'VAL1',
                            },
                        ]);
                        await verifyResponsesReturned([DEFAULT_RESPONSE]); // eslint-disable-line
                    });

                    it('should handle running pipeline with encrypted variables passing inside json file', async () => {
                        const rawFile = fs.readFileSync('lib/interface/cli/commands/pipeline/var.json', 'utf8');

                        const argv = { name: 'some name',
                            detach: true,
                            annotation: [],
                            'var-file': JSON.parse(rawFile),
                        };
                        const pip = new CfPipeline(argv);
                        await pip.run();
                        expect(pip.executionRequests[0].options.variables).toEqual(
                            [{ key: 'help6', value: '85858' },
                                { key: 'should_be_encrepted', value: '0000' },
                                { encrypted: true, key: 'help7', value: 'test' }],
                        );
                        await verifyResponsesReturned([DEFAULT_RESPONSE]); // eslint-disable-line
                    });

                    it('should handle running pipeline with encrypted variables passing inside yaml file', async () => {
                        const rawFile = fs.readFileSync('lib/interface/cli/commands/pipeline/var.yml', 'utf8');

                        const argv = { name: 'some name',
                            detach: true,
                            annotation: [],
                            'var-file': yaml.safeLoad(rawFile),
                        };
                        const pip = new CfPipeline(argv);
                        await pip.run();
                        expect(pip.executionRequests[0].options.variables).toEqual(
                            [{ key: 'VAR1', value: 'VAL1' },
                                { encrypted: true, key: 'VAR2', value: 'VAL2' }],
                        );
                        await verifyResponsesReturned([DEFAULT_RESPONSE]); // eslint-disable-line
                    });
                });

                describe('runImpl', () => {
                    it('should handle running pipeline', async () => {
                        const argv = { name: 'some name', detach: true };
                        const pip = new CfPipeline(argv);
                        await pip.runImpl({ pipelineName: argv.name, options: {} });
                        await verifyResponsesReturned([DEFAULT_RESPONSE]); // eslint-disable-line
                    });

                    it('should handle running pipeline in debug mode', async () => {
                        jest.spyOn(sdk.pipelines, 'debug').mockImplementation();
                        const argv = { name: 'some name', detach: true };
                        const pip = new CfPipeline(argv);
                        await pip.runImpl({ pipelineName: argv.name, options: { debug: true } });
                        expect(sdk.pipelines.debug).toBeCalled();
                        sdk.pipelines.debug.mockReset();
                    });

                    it('should handle showing logs aaa', async () => {
                        jest.spyOn(sdk.logs, 'showWorkflowLogs').mockImplementation();
                        const argv = { name: 'some name' };
                        const pip = new CfPipeline(argv);
                        pip.executionRequests = ['test'];
                        await pip.runImpl({ pipelineName: argv.name, options: {} });

                        await verifyResponsesReturned([DEFAULT_RESPONSE, DEFAULT_RESPONSE]); // eslint-disable-line
                        expect(sdk.logs.showWorkflowLogs).toBeCalled();
                    });
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
