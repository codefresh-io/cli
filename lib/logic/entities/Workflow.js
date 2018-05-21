const Entity = require('./Entity');

class Workflow extends Entity {
    constructor(data) {
        super();
        this.entityType = 'workflow';
        this.info = data;
        this.defaultColumns = ['id', 'pipeline-name', 'status', 'created', 'finished', 'totalTime', 'trigger', 'repository', 'branch'];
        this.wideColumns = [
            'id',
            'pipeline-name',
            'pipeline-Id',
            'status',
            'created',
            'finished',
            'totalTime',
            'trigger',
            'repository',
            'branch',
            'commit-Id',
        ];
    }

    getStatus() {
        return this.info.status;
    }
}

module.exports = Workflow;
