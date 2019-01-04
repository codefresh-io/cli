const { Formatter, Style } = require('../Formatter');

const CHECK_SIGN = '✓';
const CROSS_SIGN = '✗';
const PROGRESS_SIGN = '«';


const STATUS = {
    done: Style.green.appendedBy(CHECK_SIGN),
    inProgress: Style.yellow.appendedBy(PROGRESS_SIGN),
    terminating: Style.red.appendedBy(CROSS_SIGN),
};

const FORMATTER = Formatter.build()
    .style('status', input => (STATUS[input] || Style).bold.uppercase(input));

module.exports = FORMATTER;
