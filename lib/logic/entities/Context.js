const Entity = require('./Entity');
const _ = require('lodash'); // eslint-disable-line

class Context extends Entity {
    constructor(data) {
        super();
        this.entityType = 'context';
        this.info = data;
        this.name = this.info.metadata.name;
        this.type = this.info.type;
        this.defaultColumns = ['name', 'type'];
        this.wideColumns = this.defaultColumns || [];
    }

    // get the type of the context from spec.type
    getType() {
        return this.type;
    }

    static fromResponse(response) {
        return new Context({
            apiVersion: response.apiVersion,
            kind: response.kind,
            metadata: response.metadata,
            type: response.spec.type,
            spec: response.spec,
        });
    }
}

module.exports = Context;
