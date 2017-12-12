const Entity = require('./Entity');

class Workflow extends Entity {
    //TODO: add all the relavent fields for workflow - builds/id and builds return a djfferent objects (need to solve it)
    constructor(data) {
        super();
        const info = {};
        this.entityType = 'workflow';
        this.info = info;
        info.id = data._id;
        this.defaultColumns = ['id'];
        this.wideColumns = ['id'];
    }
}

module.exports = Workflow;
