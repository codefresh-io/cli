const _ = require('lodash');
const Entity = require('./Entity');
const colors = require('colors');

const milisecInMinute = 60 * 1000;

class Agent extends Entity {
    constructor(data) {
        super();
        this.entityType = 'agent';
        this.id = data.id;
        this.name = data.name;
        this.runtimes = data.runtimes;
        this.status = _.get(data, 'status.message', 'N/A');
        const lastReported = _.get(data, 'status.reportedAt', 'N/A');
        this.reported = this.pickStatusColor(lastReported)(lastReported);
        this.defaultColumns = ['name', 'runtimes', 'status', 'reported'];
    }

    // eslint-disable-next-line class-methods-use-this
    pickStatusColor(lastReported) {
        if (lastReported === 'N/A') {
            return colors.red;
        }
        const d = new Date(lastReported);
        const interval = Date.now() - d.getTime();
        if (interval > 5 * milisecInMinute) {
            return colors.yellow;
        }
        return colors.green;
    }

    static fromResponse(response) {
        return new Agent(_.pick(response, 'id', 'name', 'runtimes', 'status', 'lastReported'));
    }
}

module.exports = Agent;

