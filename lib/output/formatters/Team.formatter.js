const { Formatter, Style} = require('../Formatter');


const TEAM_TYPE = {
    default: Style.green,
    admin: Style.magenta,
};

const FORMATTER = Formatter.build()
    .style('type', input => TEAM_TYPE[input] ? TEAM_TYPE[input](input) : input)
    .style('name', Style.cyan);

module.exports = FORMATTER;
