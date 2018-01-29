const Entity = require('./Entity');

class TriggerType extends Entity {
    constructor(data) {
        super();
        this.entityType = 'trigger-type';
        this.info = data;
        this.defaultColumns = ['type', 'kind', 'uri-template', 'uri-regex'];
        this.wideColumns = this.defaultColumns.concat([]);
    }
}

module.exports = TriggerType;
