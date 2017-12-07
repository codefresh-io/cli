const Entity = require('./Entity');

class Context extends Entity {
    constructor(data) {
        super();
        this.entityType = 'context';
        const info = {};
        info.apiVersion = data.apiVersion;
        info.kind = data.kind;
        info.name = data.metadata.name;
        info.owner = data.owner;
        info.type = data.spec.type;
        this.info = info;
        this.defaultColumns = ['apiVersion', 'kind', 'name'];
        this.wideColumns = ['apiVersion', 'kind', 'name', 'owner', 'type'];
    }
}

module.exports = Context;