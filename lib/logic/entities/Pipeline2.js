const Entity = require('./Entity');

class Pipeline2 extends Entity {
    constructor(data) {
        super();
        this.entityType = 'pipeline2';
        this.info = data;
        this.defaultColumns = ['id', 'name'];
        this.wideColumns = this.defaultColumns.concat([]);
    }
}

module.exports = Pipeline2;
