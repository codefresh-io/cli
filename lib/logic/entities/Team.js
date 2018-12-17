const Entity = require('./Entity');

class Team extends Entity {
    constructor(data) {
        super();
        this.entityType = 'team';
        this.info = data;
        this.defaultColumns = ['id', 'name', 'type', 'account', 'tags', 'users'];
        this.wideColumns = this.defaultColumns.concat([]);
    }

    toDefault() {
        const data = super.toDefault();
        data.users = data.users.map(user => user.userName);
        return data;
    }

    toWide() {
        const data = super.toWide();
        data.users = data.users.map(user => user.userName);
        return data;
    }
}

module.exports = Team;
