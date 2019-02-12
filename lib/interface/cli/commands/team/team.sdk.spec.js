const getCmd = require('./get.cmd').toCommand();
const addUserCmd = require('./add.user.cmd').toCommand();
const removeUserCmd = require('./remove.user.cmd').toCommand();
const createCmd = require('./create.cmd').toCommand();
const synchronizeCmd = require('./synchronize.cmd').toCommand();

jest.mock('../../../../logic/entities/Team');

const request = require('requestretry');

const DEFAULT_RESPONSE = request.__defaultResponse();

describe('team commands', () => {
    beforeEach(async () => {
        request.__reset();
        request.mockClear();
        await configureSdk(); // eslint-disable-line
    });

    describe('get', () => {
        it('should handle getting all', async () => {
            const argv = {};
            const response = { statusCode: 200, body: [DEFAULT_RESPONSE.body] };
            request.__setResponse(response);
            await getCmd.handler(argv);
            await verifyResponsesReturned([response]); // eslint-disable-line
        });
    });

    describe('create', () => {
        it('should handle creation given board id', async () => {
            const argv = {};
            await createCmd.handler(argv);
            await verifyResponsesReturned([DEFAULT_RESPONSE]); // eslint-disable-line
        });
    });

    describe('add user', () => {
        it('should handle adding user to a team', async () => {
            const argv = { teamId: 'team id', userId: 'user id' };
            await addUserCmd.handler(argv);
            await verifyResponsesReturned([DEFAULT_RESPONSE]); // eslint-disable-line
        });
    });

    describe('remove user', () => {
        it('should handle removing user from a team', async () => {
            const argv = { teamId: 'team id', userId: 'user id' };
            await removeUserCmd.handler(argv);
            await verifyResponsesReturned([DEFAULT_RESPONSE]); // eslint-disable-line
        });
    });

    describe('synchronize', () => {
        it('should handle deleting by id', async () => {
            const argv = {
                'client-name': 'name',
                'client-type': 'type',
                'access-token': 'token',
            };
            await synchronizeCmd.handler(argv);
            await verifyResponsesReturned([DEFAULT_RESPONSE]); // eslint-disable-line
        });
    });
});
