const { workflow, pipeline } = require('../../../../logic').api;
const RunBaseCommand = require('./run.base');

class RunExternalCommand extends RunBaseCommand {
    async runImpl(request) {
        const { pipelineName, options } = request;
        this.workflowId = await pipeline.runPipelineByName(pipelineName, options);
        await this.writeToLog(this.workflowId);
        const workflowInstance = await workflow.getWorkflowById(this.workflowId);
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
    }
}
module.exports = RunExternalCommand;
