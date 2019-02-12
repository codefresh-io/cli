const { Formatter, Style } = require('../Formatter');

const TYPE = {
    registry: Style.cyan.bold,
    cron: Style.magenta.bold,
    helm: Style.blue.bold,
};

const FORMATTER = Formatter.build()
    .style('type', input => TYPE[input] ? TYPE[input](input) : input);

module.exports = FORMATTER;
