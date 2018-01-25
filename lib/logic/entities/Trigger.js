const Entity = require('./Entity');

class Trigger extends Entity {
    constructor(data) {
        super();
        this.entityType = 'trigger';
        this.info = data;
        this.defaultColumns = ['uri', 'secret', 'count'];
        this.wideColumns = this.defaultColumns.concat([]);
    }
}

module.exports = Trigger;
