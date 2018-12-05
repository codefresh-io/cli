const { Formatter, Style} = require('../../output');


const TEAM_TYPE = {
    default: Style.bold,
    admin: Style.magenta.bold,
};

const FORMATTER = Formatter.build()
    .style('type', input => TEAM_TYPE[input] ? TEAM_TYPE[input](input) : input)
    .style('tags', input => input.gray);

module.exports = FORMATTER;
