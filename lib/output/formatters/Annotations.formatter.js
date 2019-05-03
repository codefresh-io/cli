const { Formatter, Style } = require('../Formatter');


const FORMATTER = Formatter.build()
    .style('key', Style.cyan);

module.exports = FORMATTER;
