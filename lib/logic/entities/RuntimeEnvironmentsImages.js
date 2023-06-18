const Entity = require('./Entity');

class RuntimeEnvironmentImages extends Entity {
    constructor(data) {
        super();
        this.entityType = 'RuntimeEnvironmentImages';
        this.name = data.name;
        this.image = data.image;
        this.defaultColumns = ['name', 'image'];
        this.wideColumns = this.defaultColumns.concat([]);
    }

    static fromResponse(response) {
        return new RuntimeEnvironmentImages(response);
    }
}
module.exports = RuntimeEnvironmentImages;
