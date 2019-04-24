const _ = require('lodash');
const Entity = require('./Entity');

class Annotation extends Entity {
    constructor(data) {
        super();
        this.entityType = 'annotation';
        this.info = data;
        this.id = this.info._id;
        this.entity_id = this.info.entityId;
        this.entity_type = this.info.entityType;
        this.key = this.info.key;
        this.value = this.info.value;
        this.type = this.info.type;
        this.defaultColumns = ['id', 'entity_id', 'entity_type', 'key', 'value'];
        this.wideColumns = this.defaultColumns.concat(['type']);
    }

    static fromResponse(response) {
        return new Annotation(_.pick(response, '_id', 'entityId', 'entityType', 'key', 'value'));
    }
}

module.exports = Annotation;
