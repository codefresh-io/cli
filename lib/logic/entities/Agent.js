const _ = require('lodash');
const Entity = require('./Entity');
const chalk = require('chalk');

class Agent extends Entity {
    constructor(data) {
        super();
        this.entityType = 'agent';
        this.id = data.id;
        this.name = data.name;
        this.runtimes = data.runtimes;
        const status = _.get(data, 'status.healthStatus', 'N/A');
        this.status = this._pickStatusColor(status)(status);
        const lastReported = _.get(data, 'status.reportedAt', 'N/A');
        this.reported = this._pickLastReportedColor(status)(lastReported);
        this.defaultColumns = ['name', 'runtimes', 'status', 'reported'];
    }

    // eslint-disable-next-line class-methods-use-this
    _pickLastReportedColor(healthStatus) {
        switch (healthStatus) {
            case 'N/A':
                return chalk.gray;
            case 'unhealthy':
                return chalk.red;
            case 'healthy':
                return chalk.green;
            default:
                return chalk.red;
        }
    }

    _pickStatusColor(healthStatus) {
        switch (healthStatus) {
            case 'N/A':
                return chalk.white.bgGray;
            case 'unhealthy':
                return chalk.white.bgRed;
            case 'healthy':
                return chalk.black.bgGreen;
            default:
                return chalk.black.bgRed;
        }
    }

    static fromResponse(response) {
        return new Agent(_.pick(response, 'id', 'name', 'runtimes', 'status', 'lastReported'));
    }
}

module.exports = Agent;

