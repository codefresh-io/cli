const { Formatter, Style } = require('../../output');

const CHECK_SIGN = '✓';
const CROSS_SIGN = '✗';

const TYPE = {
    false: Style.red.appendedBy(CROSS_SIGN),
    true: Style.green.appendedBy(CHECK_SIGN),
};

const FORMATTER = Formatter.build()
    .style('public', input => (TYPE[input] || Style).bold(input));

module.exports = FORMATTER;
