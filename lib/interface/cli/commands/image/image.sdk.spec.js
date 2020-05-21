const getCmd = require('./get.cmd').toCommand();
const yargs = require('yargs');

let annotateCmd = require('./annotate.cmd');
let tagCmd = require('./tag.cmd');
let untagCmd = require('./untag.cmd');

annotateCmd.requiresAuthentication = false;
annotateCmd = annotateCmd.toCommand();

tagCmd.requiresAuthentication = false;
tagCmd = tagCmd.toCommand();

untagCmd.requiresAuthentication = false;
untagCmd = untagCmd.toCommand();

jest.mock('../../../../logic/entities/Image');

jest.mock('../../helpers/image', () => ({
    extractImages: images => images,
}));

const request = require('requestretry');

const DEFAULT_RESPONSE = request.__defaultResponse();

describe('image commands', () => {
    beforeEach(async () => {
        request.__reset();
        request.mockClear();
        await configureSdk(); // eslint-disable-line
    });

    describe('stop parse number', () => {
        it('should be string', async () => {
            const { numberArg } = yargs(['--numberArg', '21'])
                .parserConfiguration({
                    'parse-numbers': false,
                })
                .option('numberArg', {})
                .argv;

            expect(typeof numberArg).toBe('string');
        });

        it('should be number', async () => {
            const { numberArg } = yargs(['--numberArg', '21'])
                .option('numberArg', {})
                .argv;

            expect(typeof numberArg).toBe('number');
        });
    });

    describe('get', () => {
        it('should handle getting given id', async () => {
            const argv = { id: ['some id'], label: [], tag: [] };
            await getCmd.handler(argv);
            await verifyResponsesReturned([DEFAULT_RESPONSE]); // eslint-disable-line
        });

        it('should handle getting all', async () => {
            const argv = { label: [], tag: [] };
            const response = { statusCode: 200, body: [DEFAULT_RESPONSE.body] };
            request.__setResponse(response);
            await getCmd.handler(argv);
            await verifyResponsesReturned([response]); // eslint-disable-line
        });
    });

    describe('tag', () => {
        it('should handle tagging', async () => {
            const argv = { id: 'some id', tags: ['tag'] };
            const responses = [
                DEFAULT_RESPONSE,
            ];
            request.__queueResponses(responses);
            await tagCmd.handler(argv);
            await verifyResponsesReturned(responses); // eslint-disable-line
        });
    });

    describe('untag', () => {
        it('should handle removing tags', async () => {
            const argv = { id: 'some id', tags: ['tag'] };
            const responses = [
                DEFAULT_RESPONSE,
            ];
            request.__queueResponses(responses);
            await untagCmd.handler(argv);
            await verifyResponsesReturned(responses); // eslint-disable-line
        });
    });

    describe('annotate', () => {
        it('should handle annotating given docker image id', async () => {
            const argv = { id: 'some id', label: ['test=test'] };
            await annotateCmd.handler(argv);
            await verifyResponsesReturned([DEFAULT_RESPONSE]); // eslint-disable-line
        });

        it('should handle annotating given full image name', async () => {
            const argv = { id: 'repo/name:tag', label: ['test=test'] };
            const responses = [
                { statusCode: 200, body: [{ internalImageId: 'some id' }] },
                DEFAULT_RESPONSE,
            ];
            request.__queueResponses(responses);
            await annotateCmd.handler(argv);
            await verifyResponsesReturned(responses); // eslint-disable-line
        });

        it('should throw on no images found given image full name', async () => {
            const argv = { id: 'repo/name:tag', label: ['test=test'] };
            const response = { statusCode: 200, body: [] };
            request.__setResponse(response);

            await expect(annotateCmd.handler(argv)).rejects.toThrow();
            await verifyResponsesReturned([response]); // eslint-disable-line
        });

        it('should throw on multiple images found given image full name', async () => {
            const argv = { id: 'repo/name:tag', label: ['test=test'] };
            const response = {
                statusCode: 200,
                body: [{ internalImageId: 'some id' }, { internalImageId: 'another id' }],
            };
            request.__setResponse(response);

            await expect(annotateCmd.handler(argv)).rejects.toThrow();
            await verifyResponsesReturned([response]); // eslint-disable-line
        });
    });
});
