const CFError = require('cf-errors'); // eslint-disable-line
const Entity = require('../../logic/entities/Entity');
const _ = require('lodash');


function output(data) {
    const entities = _.isArray(data) ? data : [data];
    return entities.map((entity) => {
        if (!(entity instanceof Entity)) {
            throw new CFError('Cannot extract data for "id" output -- data contains not Entity');
        }
        return entity.toId();
    }).join('\n\r');
}

module.exports = output;
