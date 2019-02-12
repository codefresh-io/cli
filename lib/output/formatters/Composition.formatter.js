const { Formatter, Style } = require('../Formatter');


const FORMATTER = Formatter.build()
    .style('name', Style.cyan)
    .style('created', Style.datetime);

module.exports = FORMATTER;
