const Entity = require('./Entity');

class Workflow extends Entity {
    constructor(data) {
        super();
        this.entityType = 'workflow';
        this.info = data;
        this.defaultColumns = ['id', 'pipeline', 'status', 'created', 'finished', 'totalTime', 'trigger', 'repository', 'branch'];
        this.wideColumns = this.defaultColumns.concat([]);
    }

    getStatus() {
        return this.info.status;
    }
}

module.exports = Workflow;
