const _ = require('lodash');
const Entity = require('./Entity');

class Board extends Entity {
    constructor(data) {
        super();
        this.entityType = 'board';
        this.info = data;
        this.id = this.info._id;
        this.name = this.info.name;
        this.type = this.info.type;
        this.filter = this.info.filter;
        this.defaultColumns = ['id', 'name', 'filter'];
        this.wideColumns = this.defaultColumns.concat([]);
    }

    static fromResponse(response) {
        return new Board(_.pick(response, '_id', 'name', 'type', 'filter'));
    }
}

module.exports = Board;
