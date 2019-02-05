const Promise = require('bluebird');
const _ = require('lodash');
const fs = require('fs');
const yaml = require('js-yaml');
const defaults = require('../defaults');
const CFError = require('cf-errors');
const path = require('path');
const Output = require('../../../output/Output');
const sdk = require('../../../logic/sdk');
const openapiSpec = require('../../../../openapi');

const isDebug = () => (process.env.DEBUG || '').includes(defaults.DEBUG_PATTERN);

const wrapHandler = (handler, requiresAuthentication) => {
    return async (argv) => {
        try {
            Output.init(argv);
            const authManager = require('../../../logic').auth.manager;
            const currentContext = authManager.getCurrentContext();
            if (requiresAuthentication) {
                if (!currentContext) {
                    Output.printError(new CFError('Authentication error: Please create an authentication context (see codefresh auth create-context --help)'));
                    process.exit(1);
                }
                sdk.configure({
                    url: currentContext.url,
                    apiKey: currentContext.token,
                    spec: openapiSpec,
                });
            }

            if (!argv.watch) {
                await handler(argv);
                return;
            }

            let consecutiveErrors = 0;
            let initial = true;
            while (true) {
                try {
                    await handler(argv, initial);
                    consecutiveErrors = 0;
                    initial = false;
                }
                catch (err) {
                    consecutiveErrors++;
                    if (initial || consecutiveErrors > defaults.MAX_CONSECUTIVE_ERRORS_LIMIT) {
                        throw err;
                    }
                }
                await Promise.delay(argv['watch-interval']);
            }

        } catch (err) {
            Output.printError(err);
            process.exit(1);
        }
    };
};

/**
 * will return an object with key/value from parsing an array of key=value
 * @param environmentVariables
 * @returns {{}}
 */
const prepareKeyValueFromCLIEnvOption = (environmentVariables) => {
    let variables = {};
    let envArray = [];
    environmentVariables.constructor !== Array ? envArray.push(environmentVariables) : envArray = environmentVariables;
    envArray.forEach(function (vars) {
        const separator = '=';
        let fields = vars.split('=');
        let key = _.chain(vars).split(separator, 1).first().value();
        let val = _.split(vars, separator).slice(1).join(separator);
        if (_.isUndefined(key) || _.isUndefined(val)) {
            throw new CFError('Invalid environment variable format. please enter [key]=[value]');
        }
        variables[key] = val;
    });
    return variables;
};

const prepareKeyValueCompostionFromCLIEnvOption = (environmentVariables) => {
    const variables = [];
    let envArray = [];
    environmentVariables.constructor !== Array ? envArray.push(environmentVariables) : envArray = environmentVariables;
    envArray.forEach(function (vars) {
        let fields = vars.split('=');
        let key = fields[0];
        let val = fields[1];
        if (_.isUndefined(key) || _.isUndefined(val)) {
            throw new CFError('Invalid environment variable format. please enter [key]=[value]');
        }
        const obj = {
            key: key,
            value: val,
        };
        variables.push(obj);
    });
    return variables;
};

/**
 * @returns Object example: { 'data[name]': val, 'data[surname]': val2 }
 * */
const serializeObjectAsQueryParam = (object, paramName) => {
    return _.mapKeys(object, (value, key) => `${paramName}[${key}]`);
};

const crudFilenameOption = (yargs, options = {}) => {
    const filenameOption = {
        alias: options.alias || 'f',
        describe: options.describe || 'Filename or directory of spec files use to create the resource',
        global: options.global || false,
        required: options.required || false
    };
    if (options.group) {
        filenameOption.group = options.group;
    }

    yargs
        .option(options.name || 'filename', filenameOption)
        .coerce(options.name || 'filename', (arg) => {
            try {
                const rawFile = fs.readFileSync(path.resolve(process.cwd(), arg), 'utf8');
                if (arg.endsWith('.json')) {
                    return options.raw ? rawFile : JSON.parse(rawFile);
                } else if (arg.endsWith('.yml') || arg.endsWith('yaml')) {
                    return options.raw ? rawFile : yaml.safeLoad(rawFile);
                } else {
                    throw new CFError('File extension is not recognized');
                }
            } catch (err) {
                const error = new CFError({
                    message: 'Failed to read file',
                    cause: err,
                });
                Output.printError(error);
                process.exit(1);
            }
        });
};

const selectColumnsOption = (yargs, options = {}) => {
    const selectColumnsConfig = {
        alias: options.alias || 'sc',
        describe: options.describe || 'Columns to select for table output',
        group: 'Output Options',
    };
    if (options.group) {
        selectColumnsConfig.group = options.group;
    }

    yargs
        .option(options.name || 'select-columns', selectColumnsConfig)
        .coerce(options.name || 'select-columns', (arg) => {
            if (_.isEmpty(arg)) {
                return [];
            }
            return arg.split(',');
        });
};

function pathExists(p) {
    return new Promise(resolve => fs.access(p, resolve))
        .then(err => !err);
}

const readFile = Promise.promisify(fs.readFile);

function watchFile(filename, listener) {
    fs.watchFile(filename, { interval: 500 }, listener);
    const unwatcher = f => () => fs.unwatchFile(f);
    ['exit', 'SIGINT', 'SIGUSR1', 'SIGUSR2', 'uncaughtException', 'SIGTERM'].forEach((eventType) => {
        process.on(eventType, unwatcher(filename));
    });
}


module.exports = {
    wrapHandler,
    prepareKeyValueFromCLIEnvOption,
    crudFilenameOption,
    selectColumnsOption,
    prepareKeyValueCompostionFromCLIEnvOption,
    pathExists,
    readFile,
    watchFile,
    isDebug,
    serializeObjectAsQueryParam,
};
