const Entity = require('./Entity');
const _ = require('lodash');

class Context extends Entity {
    constructor(data) {
        super();
        this.entityType = 'context';
        this.info = data;
        this.defaultColumns = ['name', 'type'];
        this.wideColumns = this.defaultColumns.concat(['owner']);
    }

    // get the type of the context from spec.type
    getType() {
        return _.get(this, 'info.type');
    }
}

module.exports = Context;
