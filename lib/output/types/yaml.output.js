const CFError = require('cf-errors'); // eslint-disable-line
const Entity = require('../../logic/entities/Entity');
const yaml = require('js-yaml');
const _ = require('lodash');


function _isAbsent(value) {
    return !value && value !== false;
}

function output(data) {
    const entities = _.isArray(data) ? data : [data];
    const yamlArray = {
        items: [],
    };
    _.forEach(entities, (entity) => {
        if (!(entity instanceof Entity)) {
            throw new CFError('Cannot extract data for "yaml" output -- data contains not Entity');
        }
        const info = _.mapValues(entity.info, value => _isAbsent(value) ? null : value);
        yamlArray.items.push(info);
    });

    if (yamlArray.items.length === 1) {
        return yaml.safeDump(yamlArray.items[0]);
    }
    return yaml.safeDump(yamlArray);
}

module.exports = output;
