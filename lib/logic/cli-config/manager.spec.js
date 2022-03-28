const _ = require('lodash');
const path = require('path');

const fs = require('fs');
const Manager = require('./Manager');
const Model = require('./Model');

const { CODEFRESH_PATH: mockCodefreshPath } = require('../../interface/cli/defaults');

const mockDirPath = path.resolve(mockCodefreshPath, 'cli-config');
const mockFilePath = path.resolve(mockDirPath, 'config.yaml');

jest.mock('fs', () => { // eslint-disable-line
    const readFileSync = () => this.configFile;
    const existsSync = (targetPath) => ({
        [mockCodefreshPath]: true,
        [mockDirPath]: true,
        [mockFilePath]: this.exists,
    }[targetPath]);
    const openSync = () => null;
    const writeSync = (file, config) => {
        this.configFile = config;
    };
    const closeSync = () => null;

    const setConfigFile = (c) => {
        this.configFile = c;
    };
    const getConfigFile = () => this.configFile;
    const setFileExists = (val) => {
        this.exists = val;
    };

    return {
        configFile: null,
        exists: false,
        existsSync,
        readFileSync,
        openSync,
        closeSync,
        writeSync,
        setConfigFile,
        getConfigFile,
        setFileExists,
    };
});

jest.mock('js-yaml', () => {
    const safeLoad = (d) => d;
    const safeDump = (d) => d;
    return {
        safeLoad,
        safeDump,
    };
});

jest.mock('./schema', () => { // eslint-disable-line
    return {
        $id: 'cli-config-schema',
        $schema: 'http://json-schema.org/draft-07/schema#',
        type: 'object',
        properties: {
            output: {
                type: 'object',
                properties: {
                    pretty: {
                        type: 'boolean',
                        default: false,
                        description: 'Defines whether to show data in table view in pretty mode or not',
                    },
                    test: {
                        type: 'object',
                        properties: {
                            first: {
                                type: ['string', 'null'],
                                pattern: '.*',
                                default: null,
                                description: 'Some empty string',
                            },
                            second: {
                                type: ['string', 'null'],
                                default: 'not empty string',
                            },
                        },
                        default: {},
                    },
                },
                default: {},
            },
        },
    };
});

describe('CliConfigManager', () => {
    describe('config loading', () => {
        // this test case must be first due to node module cache
        it('should lazy load config', () => {
            fs.setFileExists(true);
            const DEFAULT_CONFIG = {
                currentProfile: 'default',
                profiles: {
                    default: Model.default(),
                },
            };
            fs.setConfigFile(DEFAULT_CONFIG);

            Manager.config(); // lazy load

            expect(Manager.config()).toEqual(Model.default());
        });

        it('should create file with default config if it not exist', () => {
            fs.setFileExists(false);
            fs.setConfigFile(null);

            Manager.loadConfig();

            const configFile = fs.getConfigFile();

            expect(configFile).not.toBeNull();
            expect(configFile.currentProfile).toBe('default');
            expect(configFile.profiles.default).toEqual(Model.default());
            expect(Manager.config()).toEqual(Model.default());
        });
    });

    describe('config validation', () => {
        it('should replace broken properties with defaults', () => {
            const INVALID_CONFIG = {
                currentProfile: 'default',
                profiles: {
                    default: {
                        output: {
                            pretty: 'asdf', // this must be boolean
                        },
                    },
                },
            };
            fs.setConfigFile(INVALID_CONFIG);
            fs.setFileExists(true);

            Manager.loadConfig(); // validates config and fixes broken props

            const configFile = fs.getConfigFile();
            const prettyDefault = _.get(Model.default(), 'output.pretty');
            expect(configFile.profiles.default.output.pretty).toBe(prettyDefault);
        });
    });
});
