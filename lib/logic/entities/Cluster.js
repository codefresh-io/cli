const Entity = require('./Entity');

class Cluster extends Entity {
    constructor(data) {
        super();
        this.entityType = 'cluster';
        this.info = data;
        this.defaultColumns = ['id', 'name'];
        this.wideColumns = this.defaultColumns.concat(['provider', 'providerAgent']);
    }
}

module.exports = Cluster;
