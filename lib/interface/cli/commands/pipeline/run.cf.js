const RunBaseCommand = require('./run.base');
const { sdk } = require('../../../../logic');
const { followLogs } = require('../../helpers/logs');

function _buildBody(data) {
    const body = {
        options: {},
        userMachineConfig: {},
    };

    ['branch', 'variables', 'annotations', 'sha', 'userYamlDescriptor', 'contexts', 'trigger']
        .filter(property => data[property])
        .forEach(property => Object.assign(body, { [property]: data[property] }));

    ['noCache', 'noCfCache', 'enableNotifications', 'resetVolume', 'skip', 'only']
        .filter(property => data[property])
        .forEach(property => Object.assign(body.options, { [property]: data[property] }));

    ['cpu', 'memory', 'disk', 'runtimeName', 'packName']
        .filter(property => data[property])
        .forEach(property => Object.assign(body.userMachineConfig, { [property]: data[property] }));

    return body;
}

class RunExternalCommand extends RunBaseCommand {
    async runImpl(request) {
        const { pipelineName, options = {} } = request;
        const interfaceMethod = options.debug ? 'debug' : 'run';
        this.workflowId = await sdk.pipelines[interfaceMethod]({ name: pipelineName }, _buildBody(options));
        if (this.executionRequests.length === 1) {
            if (this.argv.detach) {
                console.log(this.workflowId);
                return 0;
            }
            return followLogs(this.workflowId);
        }
        console.log(this.workflowId);
    }
}

module.exports = RunExternalCommand;
