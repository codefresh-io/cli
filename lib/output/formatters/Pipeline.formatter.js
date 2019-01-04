const { Formatter, Style} = require('../Formatter');

const FORMATTER = Formatter.build()
    .style('created', Style.dateDiff)
    .style('updated', Style.dateDiff);

module.exports = FORMATTER;
