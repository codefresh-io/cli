const _        = require('lodash');
const fs       = require('fs');
const yaml     = require('js-yaml');
const defaults = require('../defaults');
const CFError  = require('cf-errors');
const path     = require('path');


const printError = (error) => {
    if ((process.env.DEBUG || '').includes(defaults.DEBUG_PATTERN)) {
        console.error(error.stack);
    } else {
        console.error(error.toString());
    }
};

const wrapHandler = (handler) => {
    return async (argv) => {
        try {
            await handler(argv);
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
    let envArray  = [];
    environmentVariables.constructor !== Array ? envArray.push(environmentVariables) : envArray = environmentVariables;
    envArray.forEach(function (vars) {
        let fields = vars.split("=");
        let key    = fields[0];
        let val    = fields[1];
        if (_.isUndefined(key) || _.isUndefined(val)) {
            throw new CFError('Invalid environment variable format. please enter [key]=[value]');
        }
        variables[key] = val;
    });
    return variables;
};

const prepareKeyValueCompostionFromCLIEnvOption = (environmentVariables) => {
    const variables = [];
    let envArray    = [];
    environmentVariables.constructor !== Array ? envArray.push(environmentVariables) : envArray = environmentVariables;
    envArray.forEach(function (vars) {
        let fields = vars.split("=");
        let key    = fields[0];
        let val    = fields[1];
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

const crudFilenameOption = (yargs) => {
    yargs
        .option('filename', {
            alias: 'f',
            describe: 'Filename to use to create the resource',
        })
        .coerce('filename', (arg) => {
            try {
                return yaml.safeLoad(fs.readFileSync(path.resolve(process.cwd(), arg), 'utf8'));
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
