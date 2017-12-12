const Entity = require('./Entity');

class Composition extends Entity {
    constructor(data) {
        super();
        const info = {};
        this.entityType = 'composition';
        this.info = info;
        info.id = data._id;
        info.name = data.name;
        info.isAdvanced = data.isAdvanced;
        info.created = data.created;
        this.defaultColumns = ['id','name', 'isAdvanced'];
        this.wideColumns = ['id', 'name', 'isAdvanced', 'created'];
    }
}

module.exports = Composition;
