const Promise = require('bluebird');
const _ = require('lodash');
const fs = require('fs');
const yaml = require('js-yaml');
const defaults = require('../defaults');
const CFError = require('cf-errors');
const path = require('path');


const printError = (error) => {
    if ((process.env.DEBUG || '').includes(defaults.DEBUG_PATTERN)) {
        console.error(error.stack);
    } else {
        console.error(`${error.toString()}`);
    }
};

const wrapHandler = (handler, requiresAuthentication) => {
    return async (argv) => {
        try {
            const authManager = require('../../../logic').auth.manager;
            if (requiresAuthentication && !authManager.getCurrentContext()) {
                printError(new CFError('Authentication error: Please create an authentication context (see codefresh auth create-context --help)'));
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
            printError(err);
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
        let fields = vars.split('=');
        let key = fields[0];
        let val = fields[1];
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

const crudFilenameOption = (yargs, options = {}) => {
    const filenameOption = {
        alias: options.alias || 'f',
        describe: options.describe || 'Filename or directory of spec files use to create the resource',
    };
    if (options.group) {
        filenameOption.group = options.group;
    }

    yargs
        .option(options.name || 'filename', filenameOption)
        .coerce(options.name || 'filename', (arg) => {
            try {
                if (arg.endsWith('.json')) {
                    return JSON.parse(fs.readFileSync(path.resolve(process.cwd(), arg), 'utf8'));
                } else if (arg.endsWith('.yml') || arg.endsWith('yaml')) {
                    return yaml.safeLoad(fs.readFileSync(path.resolve(process.cwd(), arg), 'utf8'));
                } else {
                    throw new CFError('File extension is not recognized');
                }
            } catch (err) {
                const error = new CFError({
                    message: 'Failed to read file',
                    cause: err,
                });
                printError(error);
                process.exit(1);
            }
        });
};

module.exports = {
    printError,
    wrapHandler,
    prepareKeyValueFromCLIEnvOption,
    crudFilenameOption,
    prepareKeyValueCompostionFromCLIEnvOption,
};
