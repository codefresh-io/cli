const Entity = require('./Entity');

class Pipeline extends Entity {
    constructor(data) {
        super();
        this.entityType = 'pipeline';
        const info = {};
        info.id = data._id;
        info.name = data.name;
        info.imageName = data.imageName;
        info.repoOwner = data.repoOwner;
        info.repoName = data.repoName;
        this.info = info;
        this.defaultColumns = ['id','name', 'imageName', 'repoOwner'];
        this.wideColumns = ['id','name', 'imageName', 'repoOwner', 'repoName'];
    }
}

module.exports = Pipeline;
