const { log } = require('../../../../logic').api;
const RunBaseCommand = require('./run.base');
const { sdk } = require('../../../../logic');
const Workflow = require('../../../../logic/entities/Workflow');

// todo: check
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
            await log.showWorkflowLogs(this.workflowId, true);
            const buildResponse = await sdk.workflows.get({ id: this.workflowId });
            const workflowInstance = Workflow.fromResponse(buildResponse);
            switch (workflowInstance.getStatus()) {
                case 'success':
                    return 0;
                case 'error':
                    return 1;
                case 'terminated':
                    return 2;
                default:
                    return 100;
            }
        } else {
            console.log(this.workflowId);
        }
    }
}

module.exports = RunExternalCommand;
