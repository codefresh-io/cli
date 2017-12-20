const Entity = require('./Entity');

class Pipeline extends Entity {
    constructor(data) {
        super();
        this.entityType = 'pipeline';
        this.info = data;
        this.defaultColumns = ['id','name', 'imageName', 'repoOwner'];
        this.wideColumns = ['id','name', 'imageName', 'repoOwner', 'repoName'];
    }
}

module.exports = Pipeline;
