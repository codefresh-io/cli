const _ = require('lodash');
const flatten = require('flat');
const columnify = require('columnify');
const yaml = require('js-yaml');
const Style = require('../../../output/style');
const { NoPropertyError, MultiplePropertiesError, NotFullPropertyError, SchemaValidationError } = require('../../../logic/cli-config/errors');

const _jsonFormatter = data => JSON.stringify(data, null, 4);
const COLUMNIFY_OPTS = { columnSplitter: '   ', headingTransform: Style.bold.uppercase };

const propertyComparator = (a, b) => {
    const aDots = a.split('.').length;
    const bDots = b.split('.').length;
    if (aDots > bDots) return 1;
    if (aDots < bDots) return -1;

    if (a > b) return 1;
    if (a < b) return -1;
    return 0;
};


function _defaultOutput(data) {
    const flat = flatten(data);
    const columns = _.keys(flat)
        .sort(propertyComparator)
        .map((key) => {
            let value = _.get(data, key);
            if (value === null) {
                value = 'null';
            }
            return { key, value };
        });
    return columnify(columns, COLUMNIFY_OPTS);
}

function _formatter(format) {
    switch (format) {
        case 'yaml':
            return yaml.safeDump;
        case 'json':
            return _jsonFormatter;
        default:
            return _defaultOutput;
    }
}

function outputCliConfig(format, data) {
    const formatter = _formatter(format);
    console.log(formatter(data));
}

function outputCliMeta(props) {
    const columns = props.map(meta => _.mapValues(meta, (val) => {
        if (val === null) {
            return 'null';
        }
        return val;
    }));
    console.log(columnify(columns, COLUMNIFY_OPTS));
}

function printProperties(properties) {
    properties.sort(propertyComparator).forEach(prop => console.log(prop));
}

function propertyErrorHandler(e) {
    if (e instanceof NoPropertyError) {
        console.log(`Property "${e.property}" is not supported`);
        return;
    }
    if (e instanceof MultiplePropertiesError) {
        console.log('Choose one of the following properties:\n');
        printProperties(e.properties);
        return;
    }
    if (e instanceof NotFullPropertyError) {
        console.log(`Did you mean property: ${e.property}?`);
        return;
    }
    if (e instanceof SchemaValidationError) {
        e.printErrors();
        return;
    }
    throw e;
}

module.exports = {
    outputCliConfig,
    printProperties,
    propertyErrorHandler,
    outputCliMeta,
    propertyComparator,
};
