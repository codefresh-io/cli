const Entity = require('./Entity');
const moment = require('moment');

class Workflow extends Entity {
    constructor(data) {
        super();
        this.entityType = 'workflow';
        this.info = data;
        this.defaultColumns = [
            'id', 'pipeline-name', 'status', 'created', 'started', 'finished', 'totalTime', 'trigger', 'repository', 'branch',
        ];
        this.wideColumns = [
            'id',
            'pipeline-name',
            'pipeline-Id',
            'status',
            'created',
            'started',
            'finished',
            'buildTime',
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

    static fromResponse(response) {
        const created = moment(response.created);
        const started = moment(response.started);
        const finished = moment(response.finished);
        const totalTime = moment.utc(finished.diff(created)).format('HH:mm:ss');
        const buildTime = response.started ? moment.utc(finished.diff(started)).format('HH:mm:ss') : undefined;

        return new Workflow({
            id: response.id,
            created: response.created ? new Date(response.created) : undefined,
            started: response.started ? new Date(response.started) : undefined,
            finished: response.finished ? new Date(response.finished) : undefined,
            totalTime,
            buildTime,
            status: response.status,
            'pipeline-name': response.serviceName,
            repository: `${response.repoOwner}/${response.repoName}`,
            branch: response.branchName,
            trigger: response.trigger,
            progress: response.progress,
            'pipeline-Id': response.serviceId,
            'commit-Id': response.revision,
        });
    }
}

module.exports = Workflow;
