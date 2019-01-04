const { Formatter, Style} = require('../Formatter');


const FORMATTER = Formatter.build()
    .style('name_id', Style.cyan);

module.exports = FORMATTER;
