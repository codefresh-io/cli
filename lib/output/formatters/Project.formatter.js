const _ = require('lodash');
const { Formatter, Style } = require('../Formatter');


const FORMATTER = Formatter.build()
    .style('name', Style.cyan)
    .style('tags', tags => _.join(tags, ' '));

module.exports = FORMATTER;
