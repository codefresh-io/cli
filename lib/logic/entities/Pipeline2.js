const Entity = require('./Entity');

class Pipeline2 extends Entity {
    constructor(data) {
        super();
        this.entityType = 'pipeline2';
        this.info = data;
        this.defaultColumns = ['id', 'name', 'imageName'];
        this.wideColumns = ['id', 'name', 'imageName'];
    }
}

module.exports = Pipeline2;
