const _ = require('lodash');
const Entity = require('./Entity');

class HelmRepo extends Entity {
    constructor(data) {
        super();
        this.entityType = 'helm-repo';
        this.info = data;
        this.name = this.info.Name;
        this.created = this.info.CreatedAt ? new Date(this.info.CreatedAt) : undefined;
        this.updated = this.info.UpdatedAt ? new Date(this.info.UpdatedAt) : undefined;
        this.public = this.info.Public.toString();
        this.defaultColumns = ['name', 'public', 'created', 'updated'];
        this.wideColumns = this.defaultColumns.concat([]);
    }

    static fromResponse(response) {
        return new HelmRepo(_.pick(response, 'Name', 'CreatedAt', 'Public', 'UpdatedAt'));
    }
}

module.exports = HelmRepo;
