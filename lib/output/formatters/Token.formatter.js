const { Formatter, Style } = require('../Formatter');


const FORMATTER = Formatter.build()
    .style('token_prefix', val => `${val}**************`)
    .style('created', Style.date)
    .style('name', Style.cyan);

module.exports = FORMATTER;
