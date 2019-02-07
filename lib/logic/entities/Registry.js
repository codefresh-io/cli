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

    static fromResponse(response) {
        return new Registry({
            provider: response.provider,
            name: response.name,
            kind: response.kind,
            _id: response._id,
            behindFirewall: response.behindFirewall,
            default: response.default,
        });
    }
}

module.exports = Registry;
