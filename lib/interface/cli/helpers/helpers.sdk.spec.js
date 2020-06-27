const _ = require('lodash');
const columnify = require('columnify');
const kefir = require('kefir');
const chalk = require('chalk');
const { Config } = require('codefresh-sdk');

const { normalizeValues } = require('./helm');
const { validatePipelineSpec, validatePipelineYaml } = require('./validation');
const { followLogs } = require('./logs');
const { printTableForAuthContexts } = require('./auth');
const { sdk } = require('../../../logic');

jest.mock('../../../logic/entities/Context', () => ({
    fromResponse: () => ({
        getType: () => 'yaml',
    }),
}));
jest.mock('./../../../../check-version');

jest.mock('../../../logic/entities/Workflow', () => ({
    fromResponse: () => ({
        getStatus: () => 0,
    }),
}));

jest.mock('columnify', () => jest.fn(data => data));

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

    describe('logs', () => {
        it('should handle showing logs', async () => {
            const workflowId = 'id';
            jest.spyOn(process, 'exit').mockImplementation();
            jest.spyOn(sdk.logs, 'showWorkflowLogs').mockImplementation();
            await followLogs(workflowId);
            expect(sdk.logs.showWorkflowLogs).toBeCalled();
            await verifyResponsesReturned([DEFAULT_RESPONSE]); // eslint-disable-line
        });
        it('should not show logs if check version throw an exception', async () => {
            const workflowId = 'id';
            jest.spyOn(sdk.logs, 'showWorkflowLogs').mockImplementation();
            const checkVersion = require('./../../../../check-version');
            checkVersion.mockClear().mockImplementation(() => {
                throw new Error();
            });
            await followLogs(workflowId);
            expect(sdk.logs.showWorkflowLogs).not.toBeCalled();
        });
    });

    describe('auth', () => {
        describe('printTableForAuthContexts', () => {
            beforeEach(() => {
                jest.spyOn(console, 'log');
                jest.spyOn(kefir, 'sequentially');
                columnify.mockClear();
                const addAccountInfo = jest.fn(() => Promise.resolve());
                const defaultColumns = ['current', 'name'];
                const contexts = {
                    current: {
                        addAccountInfo,
                        defaultColumns,
                        current: true,
                        name: 'current',
                    },
                    nonCurrent: {
                        addAccountInfo,
                        defaultColumns,
                        name: 'nonCurrent',
                    },
                };
                const managerMock = {
                    getCurrentContext: jest.fn(() => contexts.current),
                    getAllContexts: jest.fn(() => contexts),
                };
                Config.manager = () => managerMock;
                Config.MOCK_CONTEXTS = contexts;
                Config.ADD_ACCOUNT_INFO_MOCK = addAccountInfo;
            });

            it('should log fallback message when no current context and no sdk context', async () => {
                Config.manager().getCurrentContext = jest.fn(() => undefined);
                sdk.config.context = undefined;

                await printTableForAuthContexts();

                expect(console.log).toBeCalledWith('No authentication contexts. Please create an authentication context (see codefresh auth create-context --help)'); // eslint-disable-line
                expect(Config.manager().getCurrentContext).toBeCalled();
                expect(kefir.sequentially).not.toBeCalled();
            });

            it('should log fallback message when no current context and when sdk context isNoAuth', async () => {
                Config.manager().getCurrentContext = jest.fn(() => undefined);
                sdk.config.context = { isNoAuth: true };

                await printTableForAuthContexts();

                expect(console.log).toBeCalledWith('No authentication contexts. Please create an authentication context (see codefresh auth create-context --help)'); // eslint-disable-line
                expect(Config.manager().getCurrentContext).toBeCalled();
                expect(kefir.sequentially).not.toBeCalled();
            });

            it('should log environment context when no current context but sdk context exists', async () => {
                const mockContext = Config.manager().getCurrentContext();
                const verifyContext = _.merge(_.pick(mockContext, mockContext.defaultColumns), { current: chalk.green('*') });
                sdk.config.context = mockContext;
                Config.manager().getCurrentContext = jest.fn(() => undefined);

                await printTableForAuthContexts();

                expect(console.log).toBeCalledWith('Using authentication context created from CF_API_KEY env variable:');
                expect(console.log).lastCalledWith([verifyContext]);
                expect(Config.manager().getCurrentContext).toBeCalled();
                expect(Config.manager().getAllContexts).not.toBeCalled();
                expect(kefir.sequentially).toBeCalled();
            });

            it('should log environment context when there is current context but sdk context differs', async () => {
                const mockContext = _.clone(Config.manager().getCurrentContext());
                mockContext.name = 'sdk context';
                const verifyContext = _.merge(_.pick(mockContext, mockContext.defaultColumns), { current: chalk.green('*') });
                sdk.config.context = mockContext;

                await printTableForAuthContexts();

                expect(console.log).toBeCalledWith('Using authentication context created from CF_API_KEY env variable:');
                expect(console.log).lastCalledWith([verifyContext]);
                expect(Config.manager().getCurrentContext).toBeCalled();
                expect(Config.manager().getAllContexts).not.toBeCalled();
                expect(kefir.sequentially).toBeCalled();
            });

            it('should log all contexts when filter is "all"', async () => {
                sdk.config.context = Config.manager().getCurrentContext();
                const verifyContexts = _.map(_.values(Config.MOCK_CONTEXTS), context => _.mapValues(_.pick(context, context.defaultColumns), (val, key) => {
                    if (key === 'current') return chalk.green('*');
                    return val;
                }));

                await printTableForAuthContexts();

                expect(console.log).toBeCalledWith(verifyContexts);
                expect(Config.manager().getCurrentContext).toBeCalled();
                expect(Config.manager().getAllContexts).toBeCalled();
                expect(kefir.sequentially).toBeCalled();
            });

            it('should log current context when filter is "current"', async () => {
                const mockContext = Config.manager().getCurrentContext();
                const verifyContext = _.merge(_.pick(mockContext, mockContext.defaultColumns), { current: chalk.green('*') });
                sdk.config.context = mockContext;

                await printTableForAuthContexts({ filter: 'current' });

                expect(console.log).lastCalledWith([verifyContext]);
                expect(Config.manager().getCurrentContext).toBeCalled();
                expect(Config.manager().getAllContexts).not.toBeCalled();
                expect(kefir.sequentially).toBeCalled();
            });

            it('should add account info for each context', async () => {
                sdk.config.context = Config.manager().getCurrentContext();

                await printTableForAuthContexts();

                expect(kefir.sequentially).toBeCalled();
                expect(Config.ADD_ACCOUNT_INFO_MOCK).toBeCalledTimes(_.keys(Config.MOCK_CONTEXTS).length);
            });
        });
    });
});
