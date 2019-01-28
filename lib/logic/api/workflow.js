const Promise = require('bluebird');
const CFError = require('cf-errors'); // eslint-disable-line
const { sendHttpRequest } = require('./helper');
const Workflow = require('../entities/Workflow');
const moment = require('moment');
const endStatuses = ['error' , 'success' , 'terminated'];


const getWorkflowById = async (id) => {
    const options = {
        url: `/api/builds/${id}`,
        method: 'GET',
    };
    const response = await sendHttpRequest(options);
    return Workflow.fromResponse(response);
};

// todo: move to sdk
const waitForStatus = async (workflowId, desiredStatus, timeoutDate, descriptive) => {
    const currentDate = moment();
    if (currentDate.isAfter(timeoutDate)) {
        throw new CFError('Operation has timed out');
    }

    const workflow = await getWorkflowById(workflowId);
    const currentStatus = workflow.getStatus();
    if (currentStatus !== desiredStatus) {
        if (endStatuses.indexOf(currentStatus) !== -1) {
            console.log(`Build: ${workflowId} finished with status: ${currentStatus}`);
            process.exit(1);
        }
        if (descriptive) {
            console.log(`Workflow: ${workflowId} current status: ${currentStatus}`);
        }
        await Promise.delay(5000);
        return waitForStatus(workflowId, desiredStatus, timeoutDate, descriptive);
        // eslint-disable-next-line no-else-return
    } else {
        console.log(`Build: ${workflowId} status: ${desiredStatus} reached`);
        return true;
    }
};


module.exports = {
    getWorkflowById,
    waitForStatus,
};
