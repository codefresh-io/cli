const { Formatter, Style } = require('../Formatter');


const FORMATTER = Formatter.build()
    .style('name', Style.cyan)
    .style('cluster', Style.cyan);

module.exports = FORMATTER;
