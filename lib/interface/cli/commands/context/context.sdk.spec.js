const getCmd = require('./get.cmd').toCommand();
const deleteCmd = require('./delete.cmd').toCommand();
const applyCmd = require('./apply.cmd').toCommand();

const request = require('requestretry');

jest.mock('../../../../logic/entities/Context');

const DEFAULT_RESPONSE = request.__defaultResponse();

describe('context commands', () => {
    beforeEach(async () => {
        request.__reset();
        request.mockClear();
        await configureSdk(); // eslint-disable-line
    });

    describe('get', () => {
        it('should handle getting given id', async () => {
            const argv = { name: ['some name'] };
            await getCmd.handler(argv);
            await verifyResponsesReturned([DEFAULT_RESPONSE]); // eslint-disable-line
        });

        it('should handle getting all', async () => {
            const argv = {};
            const response = { statusCode: 200, body: [DEFAULT_RESPONSE.body] };
            request.__setResponse(response);
            await getCmd.handler(argv);
            await verifyResponsesReturned([response]); // eslint-disable-line
        });
    });

    describe('create', () => {
        describe('git', () => {
            describe('bitbucket', () => {
                it('should handle creation', async () => {
                    const cmd = require('./create/git/types/bitbucket.cmd');
                    const argv = { name: 'some name' };
                    await cmd.handler(argv);
                    await verifyResponsesReturned([DEFAULT_RESPONSE]); // eslint-disable-line
                });
            });
            describe('github', () => {
                it('should handle creation', async () => {
                    const cmd = require('./create/git/types/github.cmd');
                    const argv = { name: 'some name' };
                    await cmd.handler(argv);
                    await verifyResponsesReturned([DEFAULT_RESPONSE]); // eslint-disable-line
                });
            });
            describe('gitlab', () => {
                it('should handle creation', async () => {
                    const cmd = require('./create/git/types/gitlab.cmd');
                    const argv = { name: 'some name' };
                    await cmd.handler(argv);
                    await verifyResponsesReturned([DEFAULT_RESPONSE]); // eslint-disable-line
                });
            });
            describe('stash', () => {
                it('should handle creation', async () => {
                    const cmd = require('./create/git/types/stash.cmd');
                    const argv = { name: 'some name' };
                    await cmd.handler(argv);
                    await verifyResponsesReturned([DEFAULT_RESPONSE]); // eslint-disable-line
                });
            });
        });

        describe('helm-repo', () => {
            describe('http', () => {
                it('should handle creation', async () => {
                    const cmd = require('./create/helm-repo/types/http.cmd');
                    const argv = { name: 'some name', url: 'some url' };
                    await cmd.handler(argv);
                    await verifyResponsesReturned([DEFAULT_RESPONSE]); // eslint-disable-line
                });
            });
            describe('s3', () => {
                it('should handle creation', async () => {
                    const cmd = require('./create/helm-repo/types/s3.cmd');
                    const argv = {
                        name: 'some name',
                        bucket: 'some bucket',
                        'aws-access-key-id': 'test-id',
                        'aws-secret-access-key': 'test-secret',
                        'aws-default-region': 'test-region',
                    };
                    await cmd.handler(argv);
                    await verifyResponsesReturned([DEFAULT_RESPONSE]); // eslint-disable-line
                });
            });
        });

        describe('config', () => {
            it('should handle creation', async () => {
                const cmd = require('./create/createConfig.cmd');
                const argv = { name: 'some name', variable: [] };
                await cmd.handler(argv);
                await verifyResponsesReturned([DEFAULT_RESPONSE]); // eslint-disable-line
            });
        });

        describe('secret', () => {
            it('should handle creation', async () => {
                const cmd = require('./create/createSecret.cmd');
                const argv = { name: 'some name', variable: [] };
                await cmd.handler(argv);
                await verifyResponsesReturned([DEFAULT_RESPONSE]); // eslint-disable-line
            });
        });

        describe('secret yaml', () => {
            it('should handle creation', async () => {
                const cmd = require('./create/createSecretYaml.cmd');
                const argv = { name: 'some name', variable: [] };
                await cmd.handler(argv);
                await verifyResponsesReturned([DEFAULT_RESPONSE]); // eslint-disable-line
            });
        });

        describe('yaml', () => {
            it('should handle creation', async () => {
                const cmd = require('./create/createYaml.cmd');
                const argv = { name: 'some name', variable: [] };
                await cmd.handler(argv);
                await verifyResponsesReturned([DEFAULT_RESPONSE]); // eslint-disable-line
            });
        });
    });

    describe('apply', () => {
        it('should handle patching when context is found', async () => {
            const argv = { filename: { metadata: { name: 'some name' } } };
            const responses = [
                DEFAULT_RESPONSE,
                DEFAULT_RESPONSE,
            ];
            request.__queueResponses(responses);
            await applyCmd.handler(argv);
            await verifyResponsesReturned(responses); // eslint-disable-line
        });

        it('should handle creation when context not found', async () => {
            const argv = { filename: { metadata: { name: 'some name' } } };
            const responses = [
                { statusCode: 404 },
                DEFAULT_RESPONSE,
            ];
            request.__queueResponses(responses);
            await applyCmd.handler(argv);
            await verifyResponsesReturned(responses); // eslint-disable-line
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
