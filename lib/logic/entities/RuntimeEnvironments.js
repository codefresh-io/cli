const Entity = require('./Entity');

class RuntimeEnvironments extends Entity {
    constructor(data) {
        super();
        this.entityType = 'RuntimeEnvironments';
        this.info = data;
    }
}

module.exports = RuntimeEnvironments;
