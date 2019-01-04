const chalk = require('chalk');
const _ = require('lodash');
const moment = require('moment');

/**
 * chalk styles
 *
 * @see https://github.com/chalk/chalk#styles
 * */
const STYLES = [
    'black', 'red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'white', 'gray',

    'bgBlack', 'bgRed', 'bgGreen', 'bgYellow', 'bgBlue', 'bgMagenta', 'bgCyan', 'bgWhite', 'bgBlackBright',
    'bgRedBright', 'bgGreenBright', 'bgYellowBright', 'bgBlueBright', 'bgMagentaBright', 'bgCyanBright', 'bgWhiteBright',

    'reset', 'bold', 'dim', 'italic', 'underline', 'inverse', 'hidden', 'strikethrough', 'visible',
];

const _dateModifier = (modifier) => {
    return inp => _.isDate(inp) ? modifier(inp) : inp;
};

const MODIFIERS = {
    uppercase: inp => inp.toUpperCase(),
    lowercase: inp => inp.toLowerCase(),
    trim: inp => inp.trim(),
    date: _dateModifier(inp => moment(inp).format('YYYY-MM-DD')),
    datetime: _dateModifier(inp => moment(inp).format('YYYY-MM-DD, hh:mm:ss')),
    dateDiff: _dateModifier(inp => moment(inp).fromNow()),
};

const symbolAppender = (arr, styleCollector) => {
    return (symbol) => {
        arr.push(symbol);
        return styleCollector;
    };
};

const chainedGetter = (arr, symbol, styleCollector) => {
    return {
        get: () => {
            arr.push(symbol);
            return styleCollector;
        },
    };
};


/**
 * Simple wrapper over chalk.
 * Applies all chalk styles and some self-defined.
 *
 * usage: console.log(Style.red.italic.bold.uppercase.appendedBy('some char')('some text'))
 * */
let Style = function Style() {
    const styles = [];
    const after = [];
    const before = [];
    const modifiers = [];

    function _Style(input = '') {
        const style = _.isEmpty(styles) ? _.identity : styles.reduce((_chalk, _style) => _chalk[_style], chalk); // apply chalk styles
        const beforeInp = before.length ? `${before.join(' ')} ` : '';
        const afterInp = after.length ? ` ${after.join(' ')}` : '';
        const output = modifiers.reduce((inp, type) => MODIFIERS[type](inp), input); // apply modifiers
        return style(`${beforeInp}${output}${afterInp}`);
    }

    // for chain-like style
    const getters = {};
    STYLES.forEach((styleName) => {
        getters[styleName] = chainedGetter(styles, styleName, _Style);
    });
    _.keys(MODIFIERS).forEach((modifierName) => {
        getters[modifierName] = chainedGetter(modifiers, modifierName, _Style);
    });
    Object.defineProperties(_Style, getters);

    _Style.appendedBy = symbolAppender(after, _Style);
    _Style.prependedBy = symbolAppender(before, _Style);
    return _Style;
};

/**
 * Allows not to call Style(), e.g.:
 *
 * Style().red -> Style.red
 * */
Style = new Proxy(Style, {
    get(target, p) {
        return target()[p];
    },
});

module.exports = Style;

