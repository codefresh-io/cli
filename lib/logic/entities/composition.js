const Entity = require('./Entity');

class Composition extends Entity {
    constructor(data) {
        super();
        this.entityType = 'composition';
        this.info = data;
        this.defaultColumns = ['id', 'name', 'isAdvanced'];
        this.wideColumns = ['id', 'name', 'isAdvanced', 'created'];
    }
}

module.exports = Composition;
