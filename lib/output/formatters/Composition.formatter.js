const { Formatter, Style } = require('../Formatter');

const CHECK_SIGN = '✓';
const CROSS_SIGN = '✗';

const TYPE = {
    false: Style.red.appendedBy(CROSS_SIGN),
    true: Style.green.appendedBy(CHECK_SIGN),
};

const FORMATTER = Formatter.build()
    .style('isAdvanced', input => (TYPE[input] || Style).bold(input))
    .style('created', Style.datetime);

module.exports = FORMATTER;
