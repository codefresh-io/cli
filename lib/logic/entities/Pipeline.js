const moment = require('moment');
const Entity = require('./Entity');

class Pipeline extends Entity {
    constructor(data) {
        super();
        this.entityType = 'pipeline';
        this.info = data;
        this.name = this.info.metadata.name;
        this.created = moment(this.info.metadata.created).fromNow();
        this.defaultColumns = ['name', 'created'];
        this.wideColumns = this.defaultColumns.concat([]);
    }
}

module.exports = Pipeline;
