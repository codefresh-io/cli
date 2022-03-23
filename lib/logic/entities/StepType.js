const _ = require('lodash');
const Entity = require('./Entity');

class StepType extends Entity {
    constructor(data) {
        super();
        this.entityType = 'step-type';
        this.info = data;
        this.name = this.info.metadata.name;
        this.visibility = this.info.metadata.isPublic ? 'public' : 'private';
        this.official = this.info.metadata.official ? 'true' : 'false';
        this.version = this.info.metadata.version;
        this.category = this.info.metadata.categories;
        this.stage = this.info.metadata.stage;
        this.created = this.info.metadata.created_at ? new Date(this.info.metadata.created_at) : undefined;
        this.updated = this.info.metadata.updated_at ? new Date(this.info.metadata.updated_at) : undefined;
        this.metrics = this.info.metrics || {};
        this.defaultColumns = ['name', 'version', 'category', 'official', 'visibility', 'stage', 'updated', 'created'];
        this.wideColumns = this.defaultColumns;
    }

    static fromResponse(response) {
        return new StepType(_.pick(response, 'version', 'kind', 'metadata', 'spec', 'metrics'));
    }
}

module.exports = StepType;
