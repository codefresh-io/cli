const CFError = require('cf-errors');
const Entity = require('../../logic/entities/Entity');
const _ = require('lodash');
const yaml = require('js-yaml');

function output(data) {
    const entities = _.isArray(data) ? data : [data];
    const yamlArray = [];

    _.forEach(entities, (entity) => {
        if (!(entity instanceof Entity)) {
            throw new CFError('Cannot extract data for "yamlArray" output -- data contains not Entity');
        }
        yamlArray.push(entity.info);
    });

    return yaml.dump(yamlArray);
}

module.exports = output;
