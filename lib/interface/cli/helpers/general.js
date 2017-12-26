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


//
// old helper functions
//
/*const IsJson = (str) => {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
};

const toFile = (pathToFile, content) => {
    var p = new Promise((resolve, reject) => {
        fs.writeFile(pathToFile, JSON.stringify(content), (err) => {
            if (err) {
                console.log('error:' + err);
                return reject(err);
            }
            console.log(`Output was saved to file ${pathToFile}`);
            resolve(content);
        });

    });
    return p;
};

const generateRows = (type, array) => {
    var rows = [];
    switch (type) {
        case "build":
            var workflows = array.workflows;
            if (workflows) {
                _.each(workflows.docs, function (item) {
                    rows.push(new Workflow.Workflow(item).toJson());
                });
            }

            var builds = array.builds;
            if (builds) {
                _.each(builds.docs, function (item) {
                    rows.push(new Build.Build(item).toJson());
                });
            }
            break;
        case "image":
            if (Array.isArray(array)) {
                _.each(array, function (item) {
                    rows.push(new Image.Image(item).toJson());
                });
            } else {
                rows.push(new Image.Image(array).toJson());
            }
            break;
        case "composition":
            if (Array.isArray(array)) {
                _.each(array, function (item) {
                    rows.push(new Composition.Composition(item).toJson());
                });
            } else {
                rows.push(new Composition.Composition(array).toJson());
            }
            break;
    }
    return rows;
};

const toTable = (type, array, header) => {
    var rows   = generateRows(type, array);
    var footer = [];

    var table = Table(header, rows, footer, {
        borderStyle: 1,
        borderColor: "blue",
        paddingBottom: 0,
        headerAlign: "center",
        align: "center",
        color: "white"
    });

    var output = table.render();
    console.log(output);
};

const toList = (type, array) => {
    _.forEach(array, (row) => {
        const image = new Image.Image(row);
        console.log(image.toString());
    });
};*/
//
// old helper functions
//

module.exports = {
    printError,
    wrapHandler,
    prepareKeyValueFromCLIEnvOption,
    crudFilenameOption,
    prepareKeyValueCompostionFromCLIEnvOption,
};
