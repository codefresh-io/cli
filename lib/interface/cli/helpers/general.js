const Promise = require('bluebird');
const _ = require('lodash');
const fs = require('fs');
const yaml = require('js-yaml');
const defaults = require('../defaults');
const CFError = require('cf-errors');
const path = require('path');
const Output = require('../../../output/Output');
const { sdk } = require('../../../logic');

const isDebug = () => (process.env.DEBUG || '').includes(defaults.DEBUG_PATTERN);


const wrapHandler = (handler, requiresAuthentication) => {
    return async (argv) => {
        try {
            Output.init(argv);

            let requiresAuthenticationValue = requiresAuthentication;
            if (typeof requiresAuthentication === 'function') {
                requiresAuthenticationValue = requiresAuthentication(argv);
            }

            if (requiresAuthenticationValue && (!sdk.config || !sdk.config.context || sdk.config.context.isNoAuth)) {
                Output.printError(new CFError('Authentication error: Please create an authentication context (see codefresh auth create-context --help)'));// eslint-disable-line
                process.exit(1);
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
    const variables = {};
    if (!environmentVariables) {
        return variables;
    }

    const envArray = _.isArray(environmentVariables) ? environmentVariables : [environmentVariables];

    envArray.forEach((vars) => {
        const separator = '=';
        const key = _.chain(vars).split(separator, 1).first().value();
        const val = _.split(vars, separator).slice(1).join(separator);
        if (_.isUndefined(key) || _.isUndefined(val)) {
            throw new CFError('Invalid environment variable format. please enter [key]=[value]');
        }
        variables[key] = val;
    });
    return variables;
};

/**
 * will return an array of objects { key, value } from parsing an array of key=value
 * @param environmentVariables
 * @returns Array of { key, value }
 */
const prepareKeyValueObjectsFromCLIEnvOption = (environmentVariables) => {
    const variables = [];
    if (!environmentVariables) {
        return variables;
    }

    const envArray = _.isArray(environmentVariables) ? environmentVariables : [environmentVariables];

    envArray.forEach((vars) => {
        const index = vars.indexOf('=');
        if (index === -1) {
            throw new CFError('Invalid environment variable format. please enter [key]=[value]');
        }
        const key = vars.substring(0, index);
        const value = vars.substring(index + 1);
        if (_.isUndefined(key) || _.isUndefined(value)) {
            throw new CFError('Invalid environment variable format. please enter [key]=[value]');
        }
        const obj = { key, value };
        variables.push(obj);
    });
    return variables;
};

const crudFilenameOption = (yargs, options = {}) => {
    const filenameOption = {
        alias: options.alias || 'f',
        describe: options.describe || 'Filename or directory of spec files use to create the resource',
        global: options.global || false,
        required: options.required || false,
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
                }
                if (arg.endsWith('.yml') || arg.endsWith('yaml')) {
                    return options.raw ? rawFile : yaml.safeLoad(rawFile);
                }
                throw new CFError('File extension is not recognized');
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

function ignoreHttpError(e) {
    if (!e.statusCode) {
        throw e
    }
    return undefined;
}

function detectProxy() {
    const httpProxy = process.env.http_proxy || process.env.HTTP_PROXY;
    const httpsProxy = process.env.https_proxy || process.env.HTTPS_PROXY;
    const noProxy = process.env.no_proxy || process.env.NO_PROXY;
    return {
        httpProxy,
        httpsProxy,
        noProxy,
    };
}

function keyValueArrayToObject(arr) {
    return arr.reduce((acc, cur) => {
        const parts = cur.split('=');
        // eslint-disable-next-line prefer-destructuring
        acc[parts[0]] = parts[1];
        return acc;
    }, {});
}

function addProxyVariables(envVars, { httpProxy, httpsProxy, noProxy }) {
    const envVarsObj = keyValueArrayToObject(envVars);
    if (httpsProxy && !envVarsObj.HTTPS_PROXY && !envVarsObj.https_proxy) {
        envVars.push(`HTTPS_PROXY=${httpsProxy}`);
        envVars.push(`https_proxy=${httpsProxy}`);
    }
    if (httpProxy && !envVarsObj.HTTP_PROXY && !envVarsObj.http_proxy) {
        envVars.push(`HTTP_PROXY=${httpProxy}`);
        envVars.push(`http_proxy=${httpProxy}`);
    }
    if (noProxy && !envVarsObj.NO_PROXY && !envVarsObj.no_proxy) {
        envVars.push(`NO_PROXY=${noProxy}`);
        envVars.push(`no_proxy=${noProxy}`);
    }
}

module.exports = {
    wrapHandler,
    prepareKeyValueFromCLIEnvOption,
    crudFilenameOption,
    selectColumnsOption,
    prepareKeyValueObjectsFromCLIEnvOption,
    pathExists,
    readFile,
    watchFile,
    isDebug,
    ignoreHttpError,
    detectProxy,
    keyValueArrayToObject,
    addProxyVariables,
};
