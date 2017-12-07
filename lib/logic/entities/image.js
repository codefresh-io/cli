const Entity = require('./entity');

class Image extends Entity {
    constructor(data) {
        super();
        const info = {};
        info.imageName = data.imageName;
        info.branch = data.branch;
        info.created = data.created;
        info.tags = data.tags;
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
        super.toName(this.info.imageName,'Image');
    }
}

module.exports = Image;
