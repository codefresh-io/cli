const _ = require('lodash');
const Entity = require('./Entity');

class Agent extends Entity {
    constructor(data) {
        super();
        this.entityType = 'agent';
        this.id = data.id;
        this.name = data.name;
        this.runtimes = data.runtimes;
        this.status = _.get(data, 'status.message', 'N/A');
        this.defaultColumns = ['name', 'runtimes', 'status'];
    }

    static fromResponse(response) {
        return new Agent(_.pick(response, 'id', 'name', 'runtimes', 'status'));
    }
}

module.exports = Agent;

