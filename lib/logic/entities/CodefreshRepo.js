const Entity = require('./Entity');

class CodefreshRepo extends Entity {
    constructor(data) {
        super();
        this.entityType = 'codefresh-repo';
        this.info = data;
        this.defaultColumns = ['git_context', 'owner', 'name', 'name_id'];
        this.wideColumns = this.defaultColumns.concat([]);
    }

    static fromResponse(response) {
        const data = Object.assign({}, response);
        data.name_id = response.serviceName;
        data.git_context = response.provider;
        data.owner = response.owner.login;
        data.repo_shortcut = `${data.owner}/${data.name}`;
        return new CodefreshRepo(data);
    }
}

module.exports = CodefreshRepo;
