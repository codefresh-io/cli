const { workflow, pipeline } = require('../../../../logic').api;
const RunBaseCommand = require('./run.base');

class RunExternalCommand extends RunBaseCommand {
    async runImpl(request) {
        const { pipelineName, options } = request;
        this.workflowId = await pipeline.runPipelineByName(pipelineName, options);
        await this.writeToLog(this.workflowId);
    }
    async postRunAll() {
        if (this.executionRequests.length === 1) {
            const workflowInstance = await workflow.getWorkflowById(this.workflowId);
            switch (workflowInstance.getStatus()) {
                case 'success':
                    process.exit(0);
                    break;
                case 'error':
                    process.exit(1);
                    break;
                case 'terminated':
                    process.exit(2);
                    break;
                default:
                    process.exit(100);
                    break;
            }
        }
    }
}
module.exports = RunExternalCommand;
