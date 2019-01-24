const Entity = require('./Entity');
const _ = require('lodash');

class Pipeline extends Entity {
    constructor(data) {
        super();
        this.entityType = 'pipeline';
        this.info = data;
        this.name = this.info.metadata.name;
        this.created = this.info.metadata.created_at ? new Date(this.info.metadata.created_at) : undefined;
        this.updated = this.info.metadata.updated_at ? new Date(this.info.metadata.updated_at) : undefined;
        this.defaultColumns = ['name', 'updated', 'created'];
        this.wideColumns = this.defaultColumns.concat([]);
    }

    static fromResponse(response) {
        return new Pipeline(_.pick(response, 'id', 'version', 'kind', 'metadata', 'spec'));
    }
}

module.exports = Pipeline;
