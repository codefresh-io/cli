const Entity = require('./Entity');
const _ = require('lodash'); // eslint-disable-line

class Registry extends Entity {
    constructor(data) {
        super();
        this.entityType = 'registry';
        this.info = data;
        this.name = this.info.name;
        this.kind = this.info.kind;
        this.id = this.info._id;
        this.behindFirewall = this.info.behindFirewall;
        this.default = this.info.default;
        this.provider = this.info.provider;
        this.defaultColumns = ['id', 'provider', 'name', 'kind', 'behindFirewall', 'default'];
        this.wideColumns = this.defaultColumns || [];
    }

    getType() {
        return this.type;
    }
}

module.exports = Registry;
