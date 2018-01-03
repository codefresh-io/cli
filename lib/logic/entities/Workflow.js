const Entity = require('./Entity');

class Workflow extends Entity {
    constructor(data) {
        super();
        this.entityType = 'workflow';
        this.info = data;
        this.defaultColumns = ['id', 'pipeline', 'trigger', 'status', 'created', 'totalTime'];
        this.wideColumns = this.defaultColumns.concat(['finished', 'repository', 'branch']);
    }

    getStatus() {
        return this.info.status;
    }
}

module.exports = Workflow;
