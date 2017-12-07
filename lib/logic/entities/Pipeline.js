const Entity = require('./Entity');

class Pipeline extends Entity {
    constructor(data) {
        super();
        const info = {};
        info.id = data._id;
        info.name = data.name;
        info.imageName = data.imageName;
        info.repoOwner = data.repoOwner;
        info.repoName = data.repoName;
        info.created = data.created;
        this.info = info;
    }

    toWide() {
        super.toWide(this.info);
    }

    toJson() {
        super.toJson(this.info);
    }

    toYaml() {
        super.toYaml(this.info);
    }

    toName() {
        super.toName(this.info.imageName,'Pipeline');
    }
}

module.exports = Pipeline;
