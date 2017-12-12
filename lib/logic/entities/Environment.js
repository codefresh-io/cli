const Entity = require('./Entity');

class Environment extends Entity {
    constructor(data) {
        super();
        const info = {};
        this.info = info;
        this.entityType = 'environment';
        this.info = info;
        info.id = data._id;
        info.status = data.creationStatus;
        info.name = data.name;
        this.defaultColumns = ['id', 'name'];
        this.wideColumns = ['id', 'name', 'status'];
    }
}

module.exports = Environment;
