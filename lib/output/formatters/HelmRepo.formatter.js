const { Formatter, Style } = require('../Formatter');

const CHECK_SIGN = '✓';
const CROSS_SIGN = '✗';

const TYPE = {
    false: Style.red.appendedBy(CROSS_SIGN),
    true: Style.green.appendedBy(CHECK_SIGN),
};

const FORMATTER = Formatter.build()
    .style('public', input => (TYPE[input] || Style).bold(input))
    .style('created', Style.dateDiff)
    .style('updated', Style.dateDiff);

module.exports = FORMATTER;
