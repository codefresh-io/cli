const Entity = require('./Entity');

class Cluster extends Entity {
    constructor(data) {
        super();
        this.entityType = 'cluster';
        this.info = data;
        this.defaultColumns = ['id', 'name'];
        this.wideColumns = this.defaultColumns.concat(['provider', 'providerAgent']);
    }

    static fromResponse(response) {
        return new Cluster({
            id: response._id,
            name: response.selector,
            provider: response.provider,
            providerAgent: response.providerAgent,
        });
    }
}

module.exports = Cluster;
