const CFError = require('cf-errors'); // eslint-disable-line
const Entity = require('../../logic/entities/Entity');
const _ = require('lodash');


function output(data) {
    const entities = _.isArray(data) ? data : [data];
    const jsonArray = [];
    _.forEach(entities, (entity) => {
        if (!(entity instanceof Entity)) {
            throw new CFError('Cannot extract data for "json" output -- data contains not Entity');
        }
        jsonArray.push(entity.info);
    });

    if (jsonArray.length === 1) {
        return JSON.stringify(jsonArray[0], null, '\t');
    }
    return JSON.stringify(jsonArray, null, '\t');
}

module.exports = output;
