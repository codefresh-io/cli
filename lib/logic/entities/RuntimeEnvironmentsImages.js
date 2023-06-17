const Entity = require('./Entity');

class RuntimeEnvironmentsImages extends Entity {
    constructor(data) {
        super();
        this.entityType = 'RuntimeEnvironmentsImages';
        this.name = data.name;
        this.image = data.image;
        this.defaultColumns = ['name', 'image'];
        this.wideColumns = this.defaultColumns.concat([]);
    }

    static fromResponse(response) {
        return new RuntimeEnvironmentsImages(response);
    }
}
module.exports = RuntimeEnvironmentsImages;
