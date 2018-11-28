const _ = require('lodash');
const recursive = require('recursive-readdir');
const path = require('path');
const {Formatter} = require('../index');

const formatters = {};
const EMPTY_FORMATTER = new Formatter();


class FormatterRegistry {
    static get(formatterName) {
        return formatters[formatterName] || EMPTY_FORMATTER;
    }

    static set(name, formatter) {
        formatters[name] = formatter;
    }
}

recursive(path.resolve(__dirname), (err, files) => {
    _.forEach(files, (file) => {
        const ending = '.formatter.js';
        if (file.endsWith(ending)) {
            const formatter = require(file);
            const entityName =  path.parse(file).base.replace(ending, '');
            FormatterRegistry.set(entityName, formatter);
        }
    });
});

module.exports = {
    FormatterRegistry,
};
