const moment = require('moment');
const Entity = require('./Entity');

class HelmRepo extends Entity {
    constructor(data) {
        super();
        this.entityType = 'helm-repo';
        this.info = data;
        this.name = this.info.Name;
        this.created = moment(this.info.CreatedAt).fromNow();
        this.updated = moment(this.info.UpdatedAt).fromNow();
        this.public = this.info.Public.toString();
        this.defaultColumns = ['name', 'public', 'created', 'updated'];
        this.wideColumns = this.defaultColumns.concat([]);
    }
}

module.exports = HelmRepo;
