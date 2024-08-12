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
        const interfaceMethod = this._selectInterfaceMethod({
            pipelineName,
            options,
        });
        try {
            if (options && options.runtimeName) {
                await sdk.runtimeEnvs.get({ name: options.runtimeName, extend: false });
            }
        } catch (error) {
            if (error.statusCode === 404) {
                console.warn(`Runtime environment ${options.runtimeName} not found. Default runtime will be used.`);
            }
        }
        this.workflowId = await sdk.pipelines[interfaceMethod]({ name: pipelineName }, _buildBody(options));
        if (this.executionRequests.length === 1) {
            if (this.argv.returnWorkflowId) {
                return this.workflowId;
            }
            if (this.argv.detach) {
                console.log(this.workflowId);
                return 0;
            }
            return followLogs(this.workflowId);
        }
        console.log(this.workflowId);
    }

    _selectInterfaceMethod({ pipelineName, options }) {
        if (options.debug) {
            return 'debug';
        }
        if (!pipelineName && options.userYamlDescriptor) {
            return 'runYaml';
        }
        return 'run';
    }
}

module.exports = RunExternalCommand;
