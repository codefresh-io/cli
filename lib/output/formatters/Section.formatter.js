const { Formatter, Style } = require('../../output');


const FORMATTER = Formatter.build()
    .style('board', Style.bold);

module.exports = FORMATTER;
