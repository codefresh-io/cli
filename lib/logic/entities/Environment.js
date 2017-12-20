const Entity = require('./Entity');

class Environment extends Entity {
    constructor(data) {
        super();
        this.entityType = 'environment';
        this.info = data;
        this.defaultColumns = ['id', 'name'];
        this.wideColumns = ['id', 'name', 'status'];
    }
}

module.exports = Environment;
