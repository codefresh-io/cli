const Entity = require('./Entity');

class GitRepo extends Entity {
    constructor(data) {
        super();
        this.entityType = 'git-repo';
        this.info = data;
        this.defaultColumns = ['git_context', 'owner', 'name', 'repo_shortcut'];
        this.wideColumns = this.defaultColumns.concat(['private', 'ssh_url']);
    }

    static fromResponse(response) {
        const data = { ...response };
        data.git_context = response.provider;
        data.owner = response.owner.login;
        data.repo_shortcut = `${data.owner}/${data.name}`;
        return new GitRepo(data);
    }
}

module.exports = GitRepo;
