const { Formatter, Style } = require('../../output');


const FORMATTER = Formatter.build()
    .style('tag', Style.bold);

module.exports = FORMATTER;
