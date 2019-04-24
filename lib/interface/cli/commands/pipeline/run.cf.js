const RunBaseCommand = require('./run.base');
const { sdk } = require('../../../../logic');
const { followLogs } = require('../../helpers/logs');

function _buildBody(data) {
    const body = {
        options: {},
    };

    if (data.branch) {
        body.branch = data.branch;
    }

    if (data.variables) {
        body.variables = data.variables;
    }

    if (data.noCache) {
        body.options.noCache = data.noCache;
    }

    if (data.enableNotifications) {
        body.options.enableNotifications = data.enableNotifications;
    }

    if (data.resetVolume) {
        body.options.resetVolume = data.resetVolume;
    }

    if (data.sha) {
        body.sha = data.sha;
    }

    if (data.userYamlDescriptor) {
        body.userYamlDescriptor = data.userYamlDescriptor;
    }

    if (data.contexts) {
        body.contexts = data.contexts;
    }

    if (data.trigger) {
        body.trigger = data.trigger;
    }
    return body;
}

class RunExternalCommand extends RunBaseCommand {
    async runImpl(request) {
        const { pipelineName, options } = request;
        this.workflowId = await sdk.pipelines.run({ name: pipelineName }, _buildBody(options));
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
