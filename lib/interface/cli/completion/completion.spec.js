const _ = require('lodash');
const initCompletion = require('./index');

const completions = initCompletion();

function getCompletion(args) {
    return new Promise(resolve => completions.getCompletion(args, resolve));
}

jest.mock('./tree', () => {
    return {
        codefresh: {
            get: {
                pipelines: () => ['1_pip', '2_pip'],
                pip: {
                    alias: 'pipelines',
                },
            },
            generate: {},
            create: {
                context: {
                    git: {},
                    config: {},
                },
                repository: {},
                __optionHandlers: [() => ['param1', 'param2']],
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
});

jest.mock('./positional', () => { // eslint-disable-line
    return () => ({}); // do not register any positional completions
});

jest.mock('./options', () => { // eslint-disable-line
    return () => ({}); // do not register any option completions
});

process.argv = []; // completion is sensitive to process args

describe('codefresh completions', async () => {
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

    it('should display function result when completion resolves to function', async () => {
        const result = await getCompletion(['codefresh', 'get', 'pipelines', '']);
        expect(result).toEqual(['1_pip', '2_pip']);
    });

    it('should call full command function when alias is entered', async () => {
        const result = await getCompletion(['codefresh', 'get', 'pip', '']);
        expect(result).toEqual(['1_pip', '2_pip']);
    });

    it('should display function result when wrong word is entered and command path resolves to function', async () => {
        const result = await getCompletion(['codefresh', 'get', 'pip', 'asdf', 'qwer']);
        expect(result).toEqual(['1_pip', '2_pip']);
    });

    it('should display params completion when arg before last is option', async () => {
        process.argv = ['codefresh', 'create', '-f', ''];
        const result = await getCompletion(process.argv);
        expect(result).toEqual(['param1', 'param2']);
    });

    it('should resolve alias as full command when arg before last is option', async () => {
        process.argv = ['codefresh', 'crt', '-f', ''];
        const result = await getCompletion(process.argv);
        expect(result).toEqual(['param1', 'param2']);
    });

    it('should display next commands completion when option is provided with value', async () => {
        process.argv = ['codefresh', 'create', '-f', 'value', ''];
        const result = await getCompletion(process.argv);
        expect(result).toEqual(['context', 'repository']);
    });
});
