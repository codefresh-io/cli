const initCompletion = require('./index');
const { handleOptions: mockHandleOptions, fileDir: mockFileDir } = require('./helpers');

const mockCompletions = initCompletion();

function mockCwd() {
    return process.cwd();
}

function getCompletion(args) {
    return new Promise(resolve => mockCompletions.getCompletion(args, resolve));
}

jest.mock('./tree', () => ({
    codefresh: {
        get: {
            pipelines: {
                __positionalHandler: './pipelines/get.completion',
            },
            pip: {
                alias: 'pipelines',
            },
            __optionHandlers: ['./pipelines/get.completion'],
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
}), { virtual: true });

jest.mock('./pipelines/get.completion', () => { // eslint-disable-line
    return {
        positionalHandler: () => ['1_pip', '2_pip'],
        optionHandler: mockHandleOptions(['-f', '--filename'], ({ word }) => mockFileDir(word)),
    };
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

jest.mock('fs', () => {
    const existsSync = (p) => {
        if (p.startsWith(`${mockCwd()}/`)) {
            p = p.replace(`${mockCwd()}/`, '');
        }
        if (p.startsWith(mockCwd())) {
            p = p.replace(mockCwd(), '');
        }
        switch (p) {
            case '':
            case 'libe/':
            case 'libe':
            case 'another':
            case 'another/':
            case 'libe/cli':
            case 'libe/cli/':
                return true;
            default:
                return false;
        }
    };
    const lstatSync = (p) => {
        let isFile = false;
        let isDir = true;
        if (p.startsWith(`${mockCwd()}/`)) {
            p = p.replace(`${mockCwd()}/`, '');
        }
        if (p.startsWith(mockCwd())) {
            p = p.replace(mockCwd(), '');
        }
        switch (p) {
            case 'some.yaml':
            case 'libe/another.yaml':
                isFile = true;
                isDir = false;
                break;
            default:
                break;
        }
        return {
            isFile: () => isFile,
            isDirectory: () => isDir,
        };
    };

    const stat = (p, options = { bigint: false }, callback) => {
        const result = lstatSync(p);
        return callback(null, result);
    };

    const readdirSync = (p) => {
        if (p.startsWith(`${mockCwd()}/`)) {
            p = p.replace(`${mockCwd()}/`, '');
        }
        if (p.startsWith(mockCwd())) {
            p = p.replace(mockCwd(), '');
        }
        switch (p) {
            case '':
                return ['libe', 'like', 'another', 'some.yaml'];
            case 'libe':
            case 'libe/':
                return ['cli', 'clo', 'another.yaml'];
            default:
                return [];
        }
    };
    return Object.assign(jest.requireActual('fs'), {
        lstat: (p, callback) => callback(null, lstatSync(p)),
        stat: (p, callback) => callback(null, lstatSync(p)),
        access: (path, c) => c(null, true),
        readdirSync,
        existsSync,
        lstatSync,
    });
});

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
            process.argv = ['codefresh', 'generate', '-f', ''];
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

    describe('filedir', () => {
        it('should return "__files_completion__" literal to shell without --impl-file-dir', async () => {
            process.argv = ['codefresh', 'get', '-f', ''];
            const result = await getCompletion(process.argv);
            expect(result).toEqual(['__files_completion__']);
        });

        it('should list dirs and yaml files when no word passed', async () => {
            process.argv = ['codefresh', 'get', '--impl-zsh-file-dir', '-f', ''];
            const result = await getCompletion(process.argv);
            expect(result).toEqual(['__files_completion__', 'libe/', 'like/', 'another/', 'some.yaml']);
        });

        it('should return only one file when passed word resolves to it', async () => {
            process.argv = ['codefresh', 'get', '--impl-zsh-file-dir', '-f', 'some'];
            const result = await getCompletion(process.argv);
            expect(result).toEqual(['__files_completion__', 'some.yaml']);
        });

        it('should filter dirs and yaml files by word passed', async () => {
            process.argv = ['codefresh', 'get', '--impl-zsh-file-dir', '-f', 'li'];
            const result = await getCompletion(process.argv);
            expect(result).toEqual(['__files_completion__', 'libe/', 'like/']);
        });

        it('should return stubs prefixed by dir when passed word resolves to only one dir', async () => {
            process.argv = ['codefresh', 'get', '--impl-zsh-file-dir', '-f', 'lib'];
            const result = await getCompletion(process.argv);
            expect(result).toEqual(['__files_completion__', 'libe/1', 'libe/2']);
        });

        it('should return dir with slash when passed word resolves to empty dir', async () => {
            process.argv = ['codefresh', 'get', '--impl-zsh-file-dir', '-f', 'another/'];
            const result = await getCompletion(process.argv);
            expect(result).toEqual(['__files_completion__', 'another/']);
        });

        it('should return stubs prefixed by word when it equals dir name', async () => {
            process.argv = ['codefresh', 'get', '--impl-zsh-file-dir', '-f', 'libe'];
            const result = await getCompletion(process.argv);
            expect(result).toEqual(['__files_completion__', 'libe/1', 'libe/2']);
        });

        it('should list dirs and yamls prefixed by word when it equals dir name with slash', async () => {
            process.argv = ['codefresh', 'get', '--impl-zsh-file-dir', '-f', 'libe/'];
            const result = await getCompletion(process.argv);
            expect(result).toEqual(['__files_completion__', 'libe/cli/', 'libe/clo/', 'libe/another.yaml']);
        });

        it('should filter dirs and yamls by suffix when prefix equals dir', async () => {
            process.argv = ['codefresh', 'get', '--impl-zsh-file-dir', '-f', 'libe/cl'];
            const result = await getCompletion(process.argv);
            expect(result).toEqual(['__files_completion__', 'libe/cli/', 'libe/clo/']);
        });


        it('should stubs when prefix + suffix equals dir', async () => {
            process.argv = ['codefresh', 'get', '--impl-zsh-file-dir', '-f', 'libe/cli'];
            const result = await getCompletion(process.argv);
            expect(result).toEqual(['__files_completion__', 'libe/cli/1', 'libe/cli/2']);
        });

        it('should return yaml prefixed by word when prefix equals dir and suffix resolves to this yaml', async () => {
            process.argv = ['codefresh', 'get', '--impl-zsh-file-dir', '-f', 'libe/another'];
            const result = await getCompletion(process.argv);
            expect(result).toEqual(['__files_completion__', 'libe/another.yaml']);
        });
    });
});
