const Entity = require('./Entity');

class Image extends Entity {
    constructor(data) {
        super();
        this.entityType = 'image';
        this.info = data;
        this.defaultColumns = ['id', 'name', 'tag', 'created', 'size', 'sha', 'pull'];
        this.wideColumns = this.defaultColumns.concat([]);
    }
}

module.exports = Image;
