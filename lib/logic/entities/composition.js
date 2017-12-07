const Entity = require('./entity');

class Composition extends Entity {
    //TODO: add all the relavent fields for Composition
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
        super.toName(this.info.imageName,'Composition');
    }
}

module.exports = Composition;
