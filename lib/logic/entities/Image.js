const Entity = require('./Entity');

class Image extends Entity {
    constructor(data) {
        super();
        const info = {};
        this.entityType = 'image';
        info.id = data._id;
        info.name = data.imageDisplayName;
        info.branch = data.branch;
        info.created = data.created;
        info.repoOwner = data.repoOwner;
        info.repoName = data.repoName;
        this.info = info;
        this.defaultColumns = ['id','name', 'branch', 'created'];
        this.wideColumns = ['id', 'name', 'branch', 'created', 'repoOwner', 'repoName'];
    }
}

module.exports = Image;
