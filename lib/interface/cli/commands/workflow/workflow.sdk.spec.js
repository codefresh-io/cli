const getCmd = require('./get.cmd').toCommand();
const { sdk } = require('../../../../logic');

let restartCmd = require('./restart.cmd');
let logsCmd = require('./logs.cmd');
let terminateCmd = require('./terminate.cmd');
let waitCmd = require('./wait.cmd');

restartCmd.requiresAuthentication = false;
logsCmd.requiresAuthentication = false;
terminateCmd.requiresAuthentication = false;
waitCmd.requiresAuthentication = false;

restartCmd = restartCmd.toCommand();
logsCmd = logsCmd.toCommand();
terminateCmd = terminateCmd.toCommand();
waitCmd = waitCmd.toCommand();

jest.mock('../../../../logic/entities/Workflow', () => {
    return {
        fromResponse: res => res,
    };
});
jest.mock('../../helpers/logs');

const request = require('requestretry');

const DEFAULT_RESPONSE = request.__defaultResponse();

describe('workflow commands', () => {
    beforeEach(async () => {
        request.__reset();
        request.mockClear();
        await configureSdk(); // eslint-disable-line
    });

    describe('get', () => {
        it('should handle getting by id', async () => {
            const argv = { id: ['some id'] };
            const response = { statusCode: 200, body: [DEFAULT_RESPONSE.body] };
            request.__setResponse(response);

            await getCmd.handler(argv);
            await verifyResponsesReturned([response]); // eslint-disable-line
        });

        it('should handle getting by pipeline name', async () => {
            const argv = { 'pipeline-name': 'pipeline' };
            const responses = [
                {
                    statusCode: 200,
                    body: { docs: [{ metadata: { id: 'id' } }] },
                },
                {
                    statusCode: 200,
                    body: { workflows: { docs: [DEFAULT_RESPONSE.body] } },
                },
            ];
            request.__queueResponses(responses);
            await getCmd.handler(argv);
            await verifyResponsesReturned(responses); // eslint-disable-line
        });

        it('should handle getting all', async () => {
            const argv = { 'pipeline-name': [] };
            const response = {
                statusCode: 200,
                body: { workflows: { docs: [DEFAULT_RESPONSE.body] } },
            };
            request.__setResponse(response);
            await getCmd.handler(argv);
            await verifyResponsesReturned([response]); // eslint-disable-line
        });
    });

    // todo: fix firebase logs
    describe('logs', () => {
        it('should handle logs', async () => {
            jest.spyOn(process, 'exit').mockImplementation();
            jest.spyOn(sdk.logs, 'showWorkflowLogs').mockImplementation();
            const argv = {};
            await logsCmd.handler(argv);
            expect(sdk.logs.showWorkflowLogs).toBeCalled();
        });
    });

    describe('wait', () => {
        it('should handle waiting', async () => {
            const argv = { status: 'success', id: ['5c586a396d6d78651e7f96f1'], timeout: 1 };
            const response = {
                statusCode: 200,
                body: { status: 'success' },
            };
            request.__setResponse(response);
            await waitCmd.handler(argv);
            await verifyResponsesReturned([response]); // eslint-disable-line
        });
    });

    describe('terminate', () => {
        it('should handle termination', async () => {
            const argv = { id: 'workflow id' };
            const responses = [
                {
                    statusCode: 200,
                    body: { info: { progress: 'progress id' } },
                },
                DEFAULT_RESPONSE,
            ];
            request.__queueResponses(responses);
            await terminateCmd.handler(argv);
            await verifyResponsesReturned(responses); // eslint-disable-line
        });
    });

    describe('restart', () => {
        it('should handle restarting', async () => {
            const argv = { id: 'workflow id' };
            await restartCmd.handler(argv);
            await verifyResponsesReturned([DEFAULT_RESPONSE]); // eslint-disable-line
        });
    });
});
