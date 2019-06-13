const Entity = require('./Entity');
const _ = require('lodash');

class Step extends Entity {
    constructor(data) {
        super();
        this.entityType = 'step';
        this.info = data;
        this.id = this.info.metadata.id;
        this.name = this.info.metadata.name;
        this.created = this.info.metadata.created_at ? new Date(this.info.metadata.created_at) : undefined;
        this.updated = this.info.metadata.updated_at ? new Date(this.info.metadata.updated_at) : undefined;
        this.defaultColumns = ['name', 'updated', 'created'];
        this.wideColumns = ['id'].concat(this.defaultColumns);
    }

    static fromResponse(response) {
        return new Step(_.pick(response, 'id', 'version', 'kind', 'metadata', 'spec'));
    }
}

module.exports = Step;
