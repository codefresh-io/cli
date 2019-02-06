let createCmd = require('./create.cmd');
let replaceCmd = require('./replace.cmd');
let deleteCmd = require('./delete.cmd');

createCmd.requiresAuthentication = false;
replaceCmd.requiresAuthentication = false;
deleteCmd.requiresAuthentication = false;

createCmd = createCmd.toCommand();
replaceCmd = replaceCmd.toCommand();
deleteCmd = deleteCmd.toCommand();


jest.mock('../../helpers/validation', () => { // eslint-disable-line
    return {
        validatePipelineSpec: () => ({ valid: true }),
    };
});

const request = require('requestretry');

const DEFAULT_RESPONSE = request.__defaultResponse();

describe('root commands', () => {
    beforeEach(() => {
        request.__reset();
        request.mockClear();
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
});
