const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const openapiSpec = require('../../../../openapi');

const EXT_REG_EX = /.*\.(yaml|yml|json)$/;

/**
 *  load auth context for dynamic completion
 *
 *  params are:
 *      { word, argv, option }
 *      or
 *      { word, argv }
 * */
function authContextWrapper(func) {
    return (params) => {
        const DEFAULTS = require('../defaults');
        const authManager = require('../../../logic').auth.manager;
        authManager.loadContexts(process.env.CF_API_KEY, process.env.CF_URL || DEFAULTS.URL, DEFAULTS.CFCONFIG);
        const currentContext = authManager.getCurrentContext();
        if (currentContext) {
            const sdk = require('../../../logic/sdk');
            sdk.configure({
                url: currentContext.url,
                apiKey: currentContext.token,
                spec: openapiSpec,
            });
        }
        return func(params);
    };
}

/**
 * params are always { word, argv, option }
 * */
function handleOptions(options, handler) {
    return (params) => {
        if (options.includes(params.option)) {
            return handler(params);
        }
        return null;
    };
}

function _listFilesDirs(cwd) {
    return fs.readdirSync(cwd)
        .map(p => path.basename(p))
        .filter(p => EXT_REG_EX.test(p) || fs.lstatSync(path.resolve(cwd, p)).isDirectory());
}

/**
 * This function is specialised on providing file-dir completions.
 *
 * When '--impl-zsh-file-dir' is not passed it will return "__files_completion__" literal,
 * which means that shell must generate file-dir completions itself (bash case).
 *
 * Otherwise function will generate file-dir completions specifically oriented on zsh.
 * */
function fileDir(word) {
    if (!process.argv.includes('--impl-zsh-file-dir')) {
        return ['__files_completion__'];
    }

    let cwd = path.resolve(process.cwd(), word);
    const pathExists = fs.existsSync(cwd);
    if (pathExists && fs.lstatSync(cwd).isDirectory() && !_.isEmpty(word) && !word.endsWith('/')) {
        return ['__files_completion__', `${word}/1`, `${word}/2`];
    }

    const suffix = word.endsWith('/') ? '' : path.basename(word);
    let prefix = word.replace(new RegExp(`${suffix}$`), '');
    if (!pathExists) {
        cwd = cwd.replace(new RegExp(`${suffix}$`), '');
    }

    let res = _listFilesDirs(cwd)
        .filter(p => p.startsWith(suffix))
        .map(p => (EXT_REG_EX.test(p) || fs.lstatSync(path.resolve(cwd, p)).isFile()) ? p : `${p}/`);

    if (res.length === 1 && fs.lstatSync(path.resolve(cwd, res[0])).isDirectory()) {
        prefix = `${prefix}${res[0]}`;
        res = ['1', '2']; // will complete just to dir's slash
    }

    // when dir has no sub-dirs or appr. files return to completion script just prefix
    if (res.length === 0) {
        res.push('');
    }

    res = res.map(p => `${prefix}${p}`);

    return ['__files_completion__', ...res];
}

module.exports = {
    authContextWrapper,
    handleOptions,
    fileDir,
};
