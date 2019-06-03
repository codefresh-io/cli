let createCmd = require('./create.cmd');
let replaceCmd = require('./replace.cmd');
let deleteCmd = require('./delete.cmd');
let versionCmd = require('./version.cmd');
let approveCmd = require('../workflow/approve.cmd');
let denyCmd = require('../workflow/approve.cmd');

createCmd.requiresAuthentication = false;
replaceCmd.requiresAuthentication = false;
deleteCmd.requiresAuthentication = false;
versionCmd.requiresAuthentication = false;
approveCmd.requiresAuthentication = false;
denyCmd.requiresAuthentication = false;

createCmd = createCmd.toCommand();
replaceCmd = replaceCmd.toCommand();
deleteCmd = deleteCmd.toCommand();
versionCmd = versionCmd.toCommand();
approveCmd = approveCmd.toCommand();
denyCmd = denyCmd.toCommand();


jest.mock('../../helpers/validation', () => { // eslint-disable-line
    return {
        validatePipelineSpec: () => ({ valid: true }),
    };
});

const request = require('requestretry');

const DEFAULT_RESPONSE = request.__defaultResponse();

describe('root commands', () => {
    beforeEach(async () => {
        request.__reset();
        request.mockClear();
        await configureSdk(); // eslint-disable-line
    });

    describe('create', () => {
        describe('context', async () => {
            it('should handle creation from spec', async () => {
                const argv = {
                    filename: {
                        kind: 'context',
                        metadata: {
                            name: 'name',
                        },
                    },
                };
                await createCmd.handler(argv);
                await verifyResponsesReturned([DEFAULT_RESPONSE]); // eslint-disable-line
            });
        });

        describe('pipeline', async () => {
            it('should handle creation from spec', async () => {
                const argv = {
                    filename: {
                        kind: 'pipeline',
                        metadata: {
                            name: 'name',
                        },
                    },
                };
                await createCmd.handler(argv);
                await verifyResponsesReturned([DEFAULT_RESPONSE]); // eslint-disable-line
            });
        });
    });

    describe('delete', () => {
        describe('context', async () => {
            it('should handle deletion by spec', async () => {
                const argv = {
                    filename: {
                        kind: 'context',
                        metadata: {
                            name: 'name',
                        },
                    },
                };
                await deleteCmd.handler(argv);
                await verifyResponsesReturned([DEFAULT_RESPONSE]); // eslint-disable-line
            });
        });

        describe('pipeline', async () => {
            it('should handle deletion by spec', async () => {
                const argv = {
                    filename: {
                        kind: 'pipeline',
                        metadata: {
                            name: 'name',
                        },
                    },
                };
                await deleteCmd.handler(argv);
                await verifyResponsesReturned([DEFAULT_RESPONSE]); // eslint-disable-line
            });
        });
    });

    describe('replace', () => {
        describe('context', async () => {
            it('should handle replacing by spec', async () => {
                const argv = {
                    filename: {
                        kind: 'context',
                        metadata: {
                            name: 'name',
                        },
                    },
                };
                await replaceCmd.handler(argv);
                await verifyResponsesReturned([DEFAULT_RESPONSE]); // eslint-disable-line
            });
        });

        describe('pipeline', async () => {
            it('should handle replacing by spec', async () => {
                const argv = {
                    filename: {
                        kind: 'pipeline',
                        metadata: {
                            name: 'name',
                        },
                    },
                };
                await replaceCmd.handler(argv);
                await verifyResponsesReturned([DEFAULT_RESPONSE]); // eslint-disable-line
            });
        });
    });

    describe('version', () => {
        describe('api', async () => {
            it('should handle getting version', async () => {
                const argv = { component: 'api' };
                await versionCmd.handler(argv);
                await verifyResponsesReturned([DEFAULT_RESPONSE]); // eslint-disable-line
            });
        });

        describe('hermes', async () => {
            it('should handle getting version', async () => {
                const argv = { component: 'hermes' };
                await versionCmd.handler(argv);
                await verifyResponsesReturned([DEFAULT_RESPONSE]); // eslint-disable-line
            });
        });

        describe('nomios', async () => {
            it('should handle getting version', async () => {
                const argv = { component: 'nomios' };
                await versionCmd.handler(argv);
                await verifyResponsesReturned([DEFAULT_RESPONSE]); // eslint-disable-line
            });
        });
    });

    describe('Approve pending-approval workflow', () => {
        it('should handle approve from spec', async () => {
            const argv = {
                buildId: 'buildId'
            };
            await approveCmd.handler(argv);
            await verifyResponsesReturned([DEFAULT_RESPONSE, DEFAULT_RESPONSE]); // eslint-disable-line
        });
    });

    describe('Deny pending-approval workflow', () => {
        it('should handle deny from spec', async () => {
            const argv = {
                buildId: 'buildId'
            };
            await denyCmd.handler(argv);
            await verifyResponsesReturned([DEFAULT_RESPONSE, DEFAULT_RESPONSE]); // eslint-disable-line
        });
    });
});
