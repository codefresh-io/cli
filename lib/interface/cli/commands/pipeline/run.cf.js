const { workflow, pipeline, log } = require('../../../../logic').api;
const RunBaseCommand = require('./run.base');

class RunExternalCommand extends RunBaseCommand {
    async runImpl(request) {
        const { pipelineName, options } = request;
        this.workflowId = await pipeline.runPipelineByName(pipelineName, options);
        if (this.executionRequests.length === 1) {
            if (this.argv.detach) {
                console.log(this.workflowId);
            } else {
                await log.showWorkflowLogs(this.workflowId, true);
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
        } else {
            console.log(this.workflowId);
        }
    }
}
module.exports = RunExternalCommand;
