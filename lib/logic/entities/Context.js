const Entity = require('./Entity');
const _ = require('lodash');

class Context extends Entity {
    constructor(data) {
        super();
        this.entityType = 'context';
        this.info = data;
        this.defaultColumns = ['apiVersion', 'kind', 'name'];
        this.wideColumns = ['apiVersion', 'kind', 'name', 'owner', 'type'];
    }

    // get the type of the context from spec.type
    getType() {
        return _.get(this, 'info.type');
    }
}

module.exports = Context;
