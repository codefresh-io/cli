const Entity = require('./Entity');

class Section extends Entity {
    constructor(data) {
        super();
        this.entityType = 'section';
        this.info = data;
        this.id = this.info._id;
        this.name = this.info.name;
        this.board = this.info.boardId;
        this.cluster = this.info.section;
        this.defaultColumns = ['id', 'name', 'board', 'cluster'];
        this.wideColumns = this.defaultColumns.concat([]);
    }
}

module.exports = Section;
