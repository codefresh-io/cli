const Entity = require('./Entity');

class RuntimeEnvironmentBaseImages extends Entity {
    constructor(data) {
        super();
        this.entityType = 'RuntimeEnvironmentBaseImages';
        this.component = data.component;
        this.image = data.image;
        this.defaultColumns = ['component', 'image'];
        this.wideColumns = this.defaultColumns.concat([]);
    }

    static fromResponse(response) {
        return new RuntimeEnvironmentBaseImages(response);
    }
}
module.exports = RuntimeEnvironmentBaseImages;

