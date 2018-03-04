const Entity = require('./Entity');

class TriggerEvent extends Entity {
    constructor(data) {
        super();
        this.entityType = 'trigger-event';
        this.info = data;
        this.defaultColumns = ['uri', 'type', 'kind', 'public', 'status'];
        this.wideColumns = this.defaultColumns.concat(['endpoint', 'description']);
    }
}

module.exports = TriggerEvent;
