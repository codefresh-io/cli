const Entity = require('./Entity');

class Environment extends Entity {
    //TODO: add all the relavent fields for Environment
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
        super.toName(this.info.imageName,'Environment');
    }
}

module.exports = Environment;
