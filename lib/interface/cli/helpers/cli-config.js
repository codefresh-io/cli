const _ = require('lodash');
const flattern = require('flat');
const columnify = require('columnify');
const yaml      = require('js-yaml');

const _jsonFormatter = (data) => JSON.stringify(data, null, 4);

const _flatteredObjComparator = (a, b) => {
    const aDots = a.split('.').length;
    const bDots = b.split('.').length;
    if (aDots > bDots) return 1;
    if (aDots < bDots) return -1;

    if (a > b) return 1;
    if (a < b) return -1;
    return 0;
};


function _defaultOutput(data) {
    const flat = flattern(data);
    const columns = _.keys(flat)
        .sort(_flatteredObjComparator)
        .map((key) => {
            return { key, value: _.get(data, key) };
        });
    return columnify(columns, {columnSplitter: '   '});
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

module.exports = {
    outputCliConfig,
};
