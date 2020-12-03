const _ = require('lodash');
const flatten = require('flat');
const columnify = require('columnify');
const yaml = require('js-yaml');
const Style = require('../../../output/Style');
const { NoPropertyError, MultiplePropertiesError, NotFullPropertyError, SchemaValidationError } = require('../../../logic/cli-config/errors');

const _jsonFormatter = data => JSON.stringify(data, null, 4);
const COLUMNIFY_OPTS = { columnSplitter: '   ', headingTransform: Style.bold.uppercase };

const NO_PROPERTIES_MESSAGE = 'no properties';
const PAGINATION_SESSION_HEADER = 'X-Pagination-Session-Id';

function _valueFormatter(value) {
    if (value === null) {
        return Style.gray('<null>');
    }
    if (typeof value === 'string') {
        return Style.green(`'${value}'`);
    }
    if (typeof value === 'boolean') {
        return Style.yellow(value);
    }
    return value;
}

function _defaultOutput(data) {
    const flat = flatten(data);
    const columns = _.keys(flat)
        .sort()
        .map((key) => {
            const value = _valueFormatter(_.get(data, key));
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
    const columns = props.map(meta => {
        meta.default = _valueFormatter(meta.default);
        return meta;
    });
    if (columns.length) {
        console.log(columnify(columns, COLUMNIFY_OPTS));
    } else {
        console.log(NO_PROPERTIES_MESSAGE);
    }
}

function printProperties(properties) {
    properties.sort().forEach(prop => console.log(prop));
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

function getSdkConfigForPagination() {
    const conf = {};
    const { HOSTNAME, CF_BUILD_ID } = process.env;

    //  if cli runs inside of the codefresh pipeline need to create pagination sessionId according to the build id and container id
    if (HOSTNAME && CF_BUILD_ID) {
        //  HOSTNAME – container id inside docker container
        const sessionId = `${HOSTNAME}:${CF_BUILD_ID}`;
        _.set(conf, `request.headers.${PAGINATION_SESSION_HEADER}`, sessionId);
    }
    return conf;
}

module.exports = {
    outputCliConfig,
    printProperties,
    propertyErrorHandler,
    outputCliMeta,
    getSdkConfigForPagination,
};
