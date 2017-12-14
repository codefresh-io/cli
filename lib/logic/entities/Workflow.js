const Entity = require('./Entity');

class Workflow extends Entity {
    //TODO: add all the relavent fields for workflow - builds/id and builds return a djfferent objects (need to solve it)
    constructor(data) {
        super();
        this.entityType = 'workflow';
        this.info = data;
        this.defaultColumns = ['id','service_Name','created','status'];
        this.wideColumns = ['id','service_Name','repo_Owner','repo_Name','branch_Name','created','status'];
    }
}

module.exports = Workflow;
