const _ = require('lodash');
const { Formatter, Style } = require('../Formatter');


const FORMATTER = Formatter.build()
    .style('token_prefix', val => `${val}**************`)
    .style('created', Style.date)
    .style('scopes', data => (_.isArray(data) && data.join('\n')) || data)
    .style('name', Style.cyan);

module.exports = FORMATTER;
