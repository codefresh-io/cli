const _ = require('lodash');
const cliConfigSchema = require('./schema');
const flatten = require('flat');


class Model {
    constructor(schema) {
        this._schema = schema;
        this._properties = _.keys(flatten(schema));
    }

    exists(propertyName) {
        const field = _.get(this._schema, propertyName);
        return field === undefined;
    }

    default() {
        return _.cloneDeep(this._schema);
    }

    properties() {
        return this._properties;
    }

    findProperties(name) {
        return this._properties.filter(prop => prop.includes(name));
    }
}

module.exports = new Model(cliConfigSchema);

