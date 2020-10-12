const _ = require('lodash');
const inquirer = require('inquirer');
const YAML = require('yaml');
const { readFileSync, lstatSync } = require('fs');
const { resolve } = require('path');
const { INSTALLATION_DEFAULTS } = require('../hybrid/helper');
const { getKubeContext } = require('../../helpers/kubernetes');

const selectRuntime = async (runtimes) => {
    const ans = await inquirer.prompt({
        type: 'list',
        name: 're',
        message: 'Name of Codefresh runtime-environment to use',
        choices: runtimes,
    });
    return ans.re;
};

const setIfNotDefined = (obj, prop, value) => {
    _.set(obj, prop, _.get(obj, prop, value));
};

const mergeWithValues = (argv) => {
    if (!argv.values || !lstatSync(resolve(process.cwd(), argv.values)).isFile()) {
        return argv;
    }
    const valuesFileStr = readFileSync(resolve(process.cwd(), argv.values), 'utf8');
    const valuesObj = YAML.parse(valuesFileStr);

    setIfNotDefined(argv, 'kube-namespace', valuesObj.Namespace || INSTALLATION_DEFAULTS.NAMESPACE);
    setIfNotDefined(argv, 'kube-context-name', valuesObj.Context || getKubeContext());
    setIfNotDefined(argv, 'host', _.get(valuesObj, 'AppProxy.Host'));
    setIfNotDefined(argv, 'runtime-environment', valuesObj.RuntimeEnvironmentName);

    return argv;
};

module.exports = {
    selectRuntime,
    mergeWithValues,
};
