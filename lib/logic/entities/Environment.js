const Entity = require('./Entity');

class Environment extends Entity {
    constructor(data) {
        super();
        this.entityType = 'environment';
        this.info = data;
        this.defaultColumns = ['id', 'name','status','serviceName','image','sha','branch','repoName','serviceURL'];
        this.wideColumns = ['id', 'name', 'status'];
    }
}

module.exports = Environment;