const Entity = require('./Entity');

class Context extends Entity {
    constructor(data) {
        super();
        this.entityType = 'context';
        this.info = data;
        this.defaultColumns = ['apiVersion', 'kind', 'name'];
        this.wideColumns = ['apiVersion', 'kind', 'name', 'owner', 'type'];
    }
}

module.exports = Context;