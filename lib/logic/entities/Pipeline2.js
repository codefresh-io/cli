const moment = require('moment');
const Entity = require('./Entity');

class Pipeline extends Entity {
    constructor(data) {
        super();
        this.entityType = 'pipeline V2';
        this.info = data;
        this.name = this.info.metadata.name;
        this.created = moment(this.info.metadata.created_at).fromNow();
        this.updated = moment(this.info.metadata.updated_at).fromNow();
        this.defaultColumns = ['name', 'updated', 'created'];
        this.wideColumns = this.defaultColumns.concat([]);
    }
}

module.exports = Pipeline;
