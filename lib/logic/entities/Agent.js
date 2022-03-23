const _ = require('lodash');
const chalk = require('chalk');
const Entity = require('./Entity');

class Agent extends Entity {
    constructor(data) {
        super();
        this.entityType = 'agent';
        this.id = data.id;
        this.name = data.name;
        this.runtimes = data.runtimes;
        const status = _.get(data, 'status.healthStatus', 'N/A');
        this.status = Agent._pickStatusColor(status)(status);
        const lastReported = _.get(data, 'status.reportedAt', 'N/A');
        this.reported = Agent._pickLastReportedColor(status)(lastReported);
        this.defaultColumns = ['name', 'runtimes', 'status', 'reported'];
    }

    static _pickLastReportedColor(healthStatus) {
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

    static _pickStatusColor(healthStatus) {
        switch (healthStatus) {
            case 'N/A':
                return chalk.white.bgGray || _.identity;
            case 'unhealthy':
                return chalk.white.bgRed || _.identity;
            case 'healthy':
                return chalk.black.bgGreen || _.identity;
            default:
                return chalk.black.bgRed || _.identity;
        }
    }

    static fromResponse(response) {
        return new Agent(_.pick(response, 'id', 'name', 'runtimes', 'status', 'lastReported'));
    }
}

module.exports = Agent;
