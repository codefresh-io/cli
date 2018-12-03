const _ = require('lodash');
const { Formatter } = require('../index');

const EMPTY_FORMATTER = new Formatter();

// can`t do it explicity, pkg dont allow dynamic require
const formatters = {
    // eslint-disable-next-line
    Workflow: require('./Workflow.formatter.js')
};

class FormatterRegistry {
    static get(formatterName) {
        return formatters[formatterName] || EMPTY_FORMATTER;
    }
}

module.exports = {
    FormatterRegistry,
};
