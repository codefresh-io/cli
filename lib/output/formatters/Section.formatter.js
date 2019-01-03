const { Formatter, Style } = require('../Formatter');


const FORMATTER = Formatter.build()
    .style('board', Style.bold);

module.exports = FORMATTER;
