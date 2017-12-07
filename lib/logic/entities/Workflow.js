const Entity = require('./Entity');

class Workflow extends Entity {
    //TODO: add all the relavent fields for workflow
    constructor(data) {
        super();
        const info = {};
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
        super.toName(this.info.imageName,'Workflow');
    }
}

module.exports = Workflow;
