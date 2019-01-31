const Entity = require('./Entity');

class Composition extends Entity {
    constructor(data) {
        super();
        this.entityType = 'composition';
        this.info = data;
        this.defaultColumns = ['id', 'name', 'is_advanced'];
        this.wideColumns = ['id', 'name', 'is_advanced', 'created'];
    }

    static fromResponse(response) {
        return new Composition({
            id: response._id,
            name: response.name,
            is_advanced: response.isAdvanced,
            created: response.created ? new Date(response.created) : undefined,
        });
    }
}

module.exports = Composition;
