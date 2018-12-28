const { Formatter, Style } = require('../../output');


const FORMATTER = Formatter.build()
    .style('token_prefix', val => `${val}**************`)
    .style('name', Style.cyan);

module.exports = FORMATTER;
