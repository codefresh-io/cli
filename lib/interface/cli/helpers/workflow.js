const { sdk } = require('../../../logic');
const Workflow = require('../../../logic/entities/Workflow');

const followLogs = async (workflowId) => {
    await sdk.logs.showWorkflowLogs(workflowId, true);
    const json = await sdk.workflows.get({ id: workflowId });
    const workflowInstance = Workflow.fromResponse(json);
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
};

module.exports = {
    followLogs,
};
