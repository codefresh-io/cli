const { Formatter, Style} = require('../Formatter');


const FORMATTER = Formatter.build()
    .style('repo_shortcut', Style.cyan);

module.exports = FORMATTER;
