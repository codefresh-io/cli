const Entity = require('./Entity');
const _ = require('lodash');

class ExposedVariables extends Entity {
    constructor(data) {
        super();
        this.entityType = 'build';
        this.info = data;
        this.variables =  _.get(data, 'exposedVariables');
        this.defaultColumns = ['id', 'pipelineName', 'variables'];
        this.wideColumns = this.defaultColumns.concat([]);
    }

    static fromResponse(response) {
        return new ExposedVariables({
            id: response._id,
            pipelineName: response.pipelineName,
            project: response.project,
            variables: response.exposedVariables,
        });
    }
}

module.exports = ExposedVariables;
