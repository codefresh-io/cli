const Entity = require('./Entity');

class Trigger extends Entity {
    constructor(data) {
        super();
        this.entityType = 'trigger';
        this.info = data;
        this.defaultColumns = ['event', 'pipeline'];
        this.wideColumns = this.defaultColumns.concat([]);
    }

    static fromResponse(response) {
        return new Trigger({
            event: response.event,
            pipeline: response.pipeline,
            filters: response.filters,
        });
    }
}

module.exports = Trigger;
