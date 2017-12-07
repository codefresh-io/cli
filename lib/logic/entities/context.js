const Entity = require('./entity');

class Context extends Entity {
    constructor(data) {
        super();
        const info = {};
        info.name = data.name;
        info.type = data.type;
        info.owner = data.owner;
        info.variables = data.variables;
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
        super.toName(this.info.imageName,'Context');
    }
}

module.exports = Context;