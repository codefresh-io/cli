const { Formatter, Style } = require('../../output');

const TYPE = {
    registry: Style.cyan.bold,
    cron: Style.magenta.bold,
};

const FORMATTER = Formatter.build()
    .style('type', input => TYPE[input] ? TYPE[input](input) : input);

module.exports = FORMATTER;
