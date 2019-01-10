const fs = require('fs');
const path = require('path');
const _ = require('lodash');

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


function log(data) {
    const p = '/home/yaroslav/work/codefresh/cli/lib/interface/cli/log.txt';
    fs.appendFileSync(p, `${data.toString()}\n`);
}

function _listFilesDirs(cwd) {
    return fs.readdirSync(cwd)
        .map(p => path.basename(p))
        .filter(p => fs.lstatSync(`${cwd}/${p}`).isDirectory() || EXT_REG_EX.test(p));
}


function fileDir(word) {
    if (!process.argv.includes('--impl-file-dir')) {
        return ['__files_completion__'];
    }

    let cwd = path.resolve(process.cwd(), word);
    const pathExists = fs.existsSync(cwd);
    if (pathExists && fs.lstatSync(cwd).isDirectory() && !_.isEmpty(word) && !word.endsWith('/')) {
        word = `${word}/`;
    }

    const suffix = word.endsWith('/') ? '' : path.basename(word);
    let prefix = word.replace(new RegExp(`${suffix}$`), '');
    if (!pathExists) {
        cwd = cwd.replace(new RegExp(`${suffix}$`), '');
    }

    log(`${cwd} --- cwd`);
    log(`${prefix} --- prefix`);
    log(`${suffix} --- suffix`);
    log(`${word} --- word`);

    let res = _listFilesDirs(cwd)
        .filter(p => p.startsWith(suffix))
        .map(p => (EXT_REG_EX.test(p) || fs.lstatSync(`${cwd}/${p}`).isFile()) ? p : `${p}/`);
    log(res);

    if (res.length === 1 && fs.lstatSync(`${cwd}/${res[0]}`).isDirectory()) {
        prefix = `${prefix}${res[0]}`;
        res = ['1', '2']; // will complete just to dir's slash
    }

    // when dir has no sub-dirs or appr. files return to completion script just prefix
    if (res.length === 0) {
        res.push('');
    }

    res = res.map(p => `${prefix}${p}`);

    log(['__files_completion__', ...res]);
    log('\n');
    return ['__files_completion__', ...res];
}

module.exports = {
    authContextWrapper,
    handleOptions,
    fileDir,
};
