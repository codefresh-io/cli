const _ = require('lodash');
const Entity = require('./Entity');

class Project extends Entity {
    constructor(data) {
        super();
        this.entityType = 'project';
        this.info = data;
        this.id = this.info.id;
        this.name = this.info.projectName;
        this.tags = this.info.tags;
        this.favorite = this.info.favorite;
        this.pipelines = this.info.pipelinesNumber;
        this.variables = this.info.variables;
        this.last_updated = this.info.updatedAt && new Date(this.info.updatedAt);
        this.defaultColumns = ['name', 'pipelines', 'last_updated', 'tags'];
        this.wideColumns = ['id'].concat(this.defaultColumns);
    }

    static fromResponse(response) {
        return new Project(_.pick(response, 'id', 'projectName', 'tags', 'variables', 'favorite', 'pipelinesNumber', 'updatedAt'));
    }
}

module.exports = Project;
