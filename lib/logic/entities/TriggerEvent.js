const Entity = require('./Entity');

class TriggerEvent extends Entity {
    constructor(data) {
        super();
        this.entityType = 'trigger-event';
        this.info = data;
        this.defaultColumns = ['uri', 'status', 'endpoint'];
        this.wideColumns = this.defaultColumns.concat(['description']);
    }
}

module.exports = TriggerEvent;
