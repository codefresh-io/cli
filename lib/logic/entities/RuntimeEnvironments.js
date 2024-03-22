const _ = require('lodash');
const Entity = require('./Entity');

class RuntimeEnvironments extends Entity {
    constructor(data) {
        super();
        this.entityType = 'RuntimeEnvironments';
        this.info = data;
        this.id = _.get(data, '_id');
        this.name = _.get(data, 'metadata.name');
        this.environmentCertPath = _.get(data, 'environmentCertPath');
        this.runtimeScheduler = _.get(data, 'runtimeScheduler');
        this.defaultUserProvidedCluster = _.get(data, 'defaultUserProvidedCluster');
        this.environmentCertPath = _.get(data, 'environmentCertPath');
        this.last_changed_by = _.get(data, 'metadata.changedBy');
        this.extends = _.get(data, 'extends');
        this.defaultColumns = ['name', 'version', 'extends', 'last_changed_by'];
        this.wideColumns = this.defaultColumns.concat([]);
    }

    static fromResponse(response) {
        return new RuntimeEnvironments(_.pick(response, [
            'version', 'metadata', 'environmentCertPath', 'runtimeScheduler',
            'dockerDaemonScheduler', 'history', 'extends', 'description', 'isPublic',
            'isDefault', 'accountId', 'plan', 'accounts', 'nonComplete', 'appProxy', 'tags',
        ]));
    }
}

module.exports = RuntimeEnvironments;
