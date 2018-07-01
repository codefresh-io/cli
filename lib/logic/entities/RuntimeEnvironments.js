const Entity = require('./Entity');
const _ = require('lodash');

class RuntimeEnvironments extends Entity {
    constructor(data) {
        super();
        this.entityType = 'RuntimeEnvironments';
        this.info = data;
        this.id = _.get(data, '_id');
        this.name = _.get(data, 'metadata.name');
        this.last_updated_by = _.get(data, 'metadata.userName');
        this.defaultColumns = ['id', 'version', 'name', 'last_updated_by'];
        this.wideColumns = this.defaultColumns.concat([]);
    }
}

module.exports = RuntimeEnvironments;
