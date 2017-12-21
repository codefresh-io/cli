const Entity = require('./Entity');

class Image extends Entity {
    constructor(data) {
        super();
        this.entityType     = 'image';
        this.info           = data;
        this.defaultColumns = ['image_id', 'name', 'tag', 'created', 'size', 'pull'];
        this.wideColumns    = this.defaultColumns.concat([]);
    }
}

module.exports = Image;
