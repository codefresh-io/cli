const _ = require('lodash');
const Ajv = require('ajv');
const flatten = require('flat');

const { SchemaValidationError } = require('./errors');
const cliConfigSchema = require('./schema.json');

const VALIDATOR = new Ajv({ coerceTypes: true, useDefaults: true });

let DEFAULTS;
let PROPERTIES;
let PROPERTIES_META;

/**
 * Every schema object need to have default set to {} in order to init its properties with default value
 * */
function _fillSchemaObjectsWithDefault(schema) {
    if (schema.type === 'object') {
        // eslint-disable-next-line no-param-reassign
        schema.default = schema.default || {};
        if (schema.properties) {
            _.values(schema.properties).forEach((value) => {
                if (typeof value === 'object') {
                    _fillSchemaObjectsWithDefault(value);
                }
            });
        }
    }
}

function _compileSchema() {
    const validate = VALIDATOR.compile(cliConfigSchema);
    const defaults = {};

    validate(defaults); // fill with default values
    return defaults;
}

function _extractMeta(props) {
    return props.reduce((obj, prop) => {
        // eslint-disable-next-line no-param-reassign
        obj[prop] = prop.split('.')
            .reduce((prev, pathPart) => prev.properties[pathPart], cliConfigSchema);
        return obj;
    }, {});
}

class Model {
    static default() {
        return _.cloneDeep(DEFAULTS);
    }

    static properties() {
        return _.cloneDeep(PROPERTIES);
    }

    static findProperties(name) {
        return PROPERTIES.filter((prop) => prop.includes(name));
    }

    static meta() {
        return _.cloneDeep(PROPERTIES_META);
    }

    /**
     * also fills with default values and coerces types
     * */
    static validate(obj) {
        if (!VALIDATOR.validate('cli-config-schema', obj)) {
            throw new SchemaValidationError(VALIDATOR.errors);
        }
    }
}

_fillSchemaObjectsWithDefault(cliConfigSchema);

DEFAULTS = _compileSchema();
PROPERTIES = _.keys(flatten(DEFAULTS));
PROPERTIES_META = _extractMeta(PROPERTIES);

module.exports = Model;
