const _ = require('lodash');
const Ajv = require('ajv');
const flatten = require('flat');

const { SchemaValidationError } = require('./errors');

const ajv = new Ajv({ coerceTypes: true, useDefaults: true });
const cliConfigSchema = require('./schema.json');

const validate = ajv.compile(cliConfigSchema);

const defaults = {};
validate(defaults); // fill with default values

const properties = _.keys(flatten(defaults));


class Model {
    static default() {
        return _.cloneDeep(defaults);
    }

    static properties() {
        return _.cloneDeep(properties);
    }

    static findProperties(name) {
        return properties.filter(prop => prop.includes(name));
    }

    /**
     * also fills with default values and coerces types
     * */
    static validate(obj) {
        if (!ajv.validate('cli-config-schema', obj)) {
            throw new SchemaValidationError(ajv.errors);
        }
    }
}

module.exports = Model;

