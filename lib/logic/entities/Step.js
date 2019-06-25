const Entity = require('./Entity');
const _ = require('lodash');

class Step extends Entity {
    constructor(data) {
        super();
        this.entityType = 'step';
        this.info = data;
        this.name = this.info.metadata.name;
        this.visibility = this.info.metadata.isPublic ? 'public' : 'private';
        this.official = this.info.metadata.official ? "true": "false";
        this.stage = this.info.metadata.stage;
        this.created = this.info.metadata.created_at ? new Date(this.info.metadata.created_at) : undefined;
        this.updated = this.info.metadata.updated_at ? new Date(this.info.metadata.updated_at) : undefined;
        this.defaultColumns = ['name', 'official', 'visibility', 'stage', 'updated', 'created'];
        this.wideColumns = this.defaultColumns;
    }

    static fromResponse(response) {
        return new Step(_.pick(response, 'version', 'kind', 'metadata', 'spec'));
    }
}

module.exports = Step;
