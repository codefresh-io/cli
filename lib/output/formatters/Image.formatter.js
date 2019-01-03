const { Formatter, Style } = require('../Formatter');

const TAG_OPTIIONS = {
    '<none>': Style.gray,
    master: Style.magenta,
};

const FORMATTER = Formatter.build()
    .style('tag', (input) => (TAG_OPTIIONS[input] || Style.cyan).bold(input));

module.exports = FORMATTER;
