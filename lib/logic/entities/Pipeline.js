const Entity = require('./Entity');

class Pipeline extends Entity {
    constructor(data) {
        super();
        this.entityType = 'pipeline';
        this.info = data;
        this.defaultColumns = ['id', 'name', 'repoOwner', 'repoName'];
        this.wideColumns = this.defaultColumns.concat([]);
    }
}

module.exports = Pipeline;
