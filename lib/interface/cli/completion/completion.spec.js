const initCompletion = require('./index');
const { handleOptions: mockHandleOptions } = require('./helpers');

const completions = initCompletion();

function getCompletion(args) {
    return new Promise(resolve => completions.getCompletion(args, resolve));
}

jest.mock('./tree', () => {
    return {
        codefresh: {
            get: {
                pipelines: {
                    __positionalHandler: './pipelines/get.completion',
                },
                pip: {
                    alias: 'pipelines',
                },
            },
            generate: {},
            create: {
                context: {
                    git: {},
                    config: {},
                    __optionHandlers: ['./context/create.completion', './root/create.completion'],
                },
                repository: {},
                __optionHandlers: ['./root/create.completion', './root/another.completion'],
            },
            crt: {
                alias: 'create',
                context: {
                    git_of_alias: {}, // typically should be equal to create.context, just for test
                    config: {},
                },
                repository: {},
            },
        },
    };
}, { virtual: true });

jest.mock('./pipelines/get.completion', () => { // eslint-disable-line
    return { positionalHandler: () => ['1_pip', '2_pip'] };
}, { virtual: true });

jest.mock('./root/create.completion', () => { // eslint-disable-line
    return {
        optionHandler: mockHandleOptions(['-f', '--filename'], () => ['param1', 'param2']),
    };
}, { virtual: true });

jest.mock('./root/another.completion', () => { // eslint-disable-line
    return {
        optionHandler: mockHandleOptions(['--another'], () => ['another']),
    };
}, { virtual: true });

jest.mock('./context/create.completion', () => { // eslint-disable-line
    return {
        optionHandler: mockHandleOptions(['-f', '--filename'], () => ['param1']),
    };
}, { virtual: true });

process.argv = []; // completion is sensitive to process args

describe('codefresh completions', () => {
    describe('static', () => {
        it('should not display any completions when no word is entered', async () => {
            const result = await getCompletion([]);
            expect(result).toEqual([]);
        });

        it('should not display any completions when wrong word is entered', async () => {
            const result = await getCompletion(['codefresh', 'asdf']);
            expect(result).toEqual([]);
        });

        it('should not display any completions when multiple wrong words are entered', async () => {
            const result = await getCompletion(['codefresh', 'asdf', 'qwer']);
            expect(result).toEqual([]);
        });

        it('should display only full commands completions', async () => {
            const result = await getCompletion(['codefresh', '']);
            expect(result).toEqual(['get', 'generate', 'create']);
        });

        it('should display full commands and not alias completions (when they are not fully entered)', async () => {
            const result = await getCompletion(['codefresh', 'cr']);
            expect(result).toEqual(['create']);
        });

        it('should display alias completion when it\'s fully entered and full command not starts with it', async () => {
            const result = await getCompletion(['codefresh', 'crt']);
            expect(result).toEqual(['crt']);
        });

        it('should resolve alias command descendants', async () => {
            const result = await getCompletion(['codefresh', 'crt', 'context', '']);
            expect(result).toEqual(['git_of_alias', 'config']);
        });
    });

    describe('dynamic', () => {
        it('should display function result when completion resolves to __positionalHandler', async () => {
            const result = await getCompletion(['codefresh', 'get', 'pipelines', '']);
            expect(result).toEqual(['1_pip', '2_pip']);
        });

        it('should call full command __positionalHandler when alias is entered', async () => {
            const result = await getCompletion(['codefresh', 'get', 'pip', '']);
            expect(result).toEqual(['1_pip', '2_pip']);
        });

        it('should display function result when wrong word is entered and command path resolves to __positionalHandler', async () => {
            const result = await getCompletion(['codefresh', 'get', 'pip', 'asdf', 'qwer']);
            expect(result).toEqual(['1_pip', '2_pip']);
        });

        it('should display option completions when arg before last is option and completion has __optionHandlers', async () => {
            process.argv = ['codefresh', 'create', '-f', ''];
            const result = await getCompletion(process.argv);
            expect(result).toEqual(['param1', 'param2']);
        });

        it('should display option completions exactly for provided option', async () => {
            process.argv = ['codefresh', 'create', '--another', ''];
            const result = await getCompletion(process.argv);
            expect(result).toEqual(['another']);
        });

        it('should resolve alias as full command when arg before last is option', async () => {
            process.argv = ['codefresh', 'crt', '-f', ''];
            const result = await getCompletion(process.argv);
            expect(result).toEqual(['param1', 'param2']);
        });

        it('should not display any option completions when it has no __optionHandlers', async () => {
            process.argv = ['codefresh', 'get', '-f', ''];
            const result = await getCompletion(process.argv);
            expect(result).toEqual([]);
        });

        // option handler overriding
        it('should display option completions from first handler when option is supported by some of __optionHandlers', async () => {
            process.argv = ['codefresh', 'create', 'context', '-f', ''];
            const result = await getCompletion(process.argv);
            expect(result).toEqual(['param1']);
        });

        it('should not display any option completions when option is not supported by any of __optionHandlers', async () => {
            process.argv = ['codefresh', 'create', '--notSupported', ''];
            const result = await getCompletion(process.argv);
            expect(result).toEqual([]);
        });

        it('should display next commands completions when option is provided with a value', async () => {
            process.argv = ['codefresh', 'create', '-f', 'value', ''];
            const result = await getCompletion(process.argv);
            expect(result).toEqual(['context', 'repository']);
        });
    });
});
