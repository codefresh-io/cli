const Entity = require('./Entity');

class Team extends Entity {
    constructor(data) {
        super();
        this.entityType = 'team';
        this.info = data;
        this.defaultColumns = ['id', 'name', 'type', 'account', 'tags', 'users'];
        this.wideColumns = this.defaultColumns.concat([]);
    }
}

module.exports = Team;
