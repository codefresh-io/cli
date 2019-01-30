const _ = require('lodash');
const Entity = require('./Entity');

class Section extends Entity {
    constructor(data) {
        super();
        this.entityType = 'section';
        this.info = data;
        this.id = this.info._id;
        this.name = this.info.name;
        this.board = this.info.boardId;
        this.board_id = this.info.boardId;
        this.cluster = this.info.section;
        this.defaultColumns = ['id', 'name', 'board_id', 'cluster'];
        this.wideColumns = this.defaultColumns.concat([]);
    }

    static fromResponse(response) {
        return new Section(_.pick(response, '_id', 'name', 'boardId', 'section'));
    }
}

module.exports = Section;
