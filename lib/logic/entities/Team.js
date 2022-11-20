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
        data.users = data.users.map((user) => user.userName);
        return data;
    }

    toWide() {
        const data = super.toWide();
        data.users = data.users.map((user) => user.userName);
        return data;
    }

    static fromResponse(response) {
        return new Team({
            id: response._id,
            name: response.name,
            type: response.type,
            account: response.account,
            tags: response.tags,
            users: response.users.map(({ _id, userName }) => ({ id: _id, userName })),
        });
    }
}

module.exports = Team;
