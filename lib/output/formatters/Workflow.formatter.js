const { Formatter, Style } = require('../../output');

const CHECK_SIGN = '✓';
const CROSS_SIGN = '✗';
const PLAY_SIGN = '▸';
const TWO_ARR_DOWN_SIGN = '⇊';
const CIRCLE_SIGN = '◉';
const BRACKET_SIGN = '«';

const STATUS_CHOICES = {
    success: Style.green.appendedBy(CHECK_SIGN),
    error: Style.red.appendedBy(CROSS_SIGN),
    terminated: Style.yellow.appendedBy(CROSS_SIGN),
    pending: Style.cyan.appendedBy(CIRCLE_SIGN),
    elected: Style.bold.appendedBy(BRACKET_SIGN),
    running: Style.magenta.appendedBy(PLAY_SIGN),
    terminating: Style.yellow.appendedBy(TWO_ARR_DOWN_SIGN),
};

const FORMATTER = Formatter.build()
    .style('id', Style.italic)
    .style('status', input => STATUS_CHOICES[input].bold.uppercase(input))
    .style('repository', Style.italic);

module.exports = FORMATTER;
