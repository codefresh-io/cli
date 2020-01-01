const _ = require('lodash');
const Entity = require('./Entity');

class Agent extends Entity {
    constructor(data) {
        super();
        this.entityType = 'agent';
        this.id = data.id;
        this.name = data.name;
        this.runtimes = data.runtimes;
        this.defaultColumns = ['name', 'runtimes'];
    }

    static fromResponse(response) {
        return new Agent(_.pick(response, 'id', 'name', 'runtimes'));
    }
}

module.exports = Agent;

