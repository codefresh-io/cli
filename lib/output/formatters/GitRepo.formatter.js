const { Formatter, Style} = require('../../output');


const FORMATTER = Formatter.build()
    .style('git_context', Style.gray)
    .style('repo_shortcut', Style.cyan);

module.exports = FORMATTER;
