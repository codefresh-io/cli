const _ = require('lodash');
const Entity = require('./Entity');
const colors = require('colors');

class Agent extends Entity {
    constructor(data) {
        super();
        this.entityType = 'agent';
        this.id = data.id;
        this.name = data.name;
        this.runtimes = data.runtimes;
        this.status = _.get(data, 'status.message', 'N/A');
        const lastReported = _.get(data, 'status.reportedAt', 'N/A');
        this.reported = this.pickStatusColor(_.get(data, 'status.healthStatus', 'N/A'))(lastReported);
        this.defaultColumns = ['name', 'runtimes', 'status', 'reported'];
    }

    // eslint-disable-next-line class-methods-use-this
    pickStatusColor(healthStatus) {
        switch (healthStatus) {
            case 'N/A':
                return colors.red;
            case 'unhealthy':
                return colors.yellow;
            case 'healthy':
                return colors.green;
            default:
                return colors.red;
        }
    }

    static fromResponse(response) {
        return new Agent(_.pick(response, 'id', 'name', 'runtimes', 'status', 'lastReported'));
    }
}

module.exports = Agent;

