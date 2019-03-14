const Promise = require('bluebird');
const _ = require('lodash');
const request = require('requestretry');

const { sdk } = require('../../../logic');
const Workflow = require('../../../logic/entities/Workflow');

const FIFTEEN_MINUTES = 15 * 60 * 1000;
const END_STATUSES = ['error', 'success', 'terminated'];


async function _fallbackLogs(workflowId, interval, consecutiveErrors) {
    try {
        console.log('Retrying to retrieve logs...');
        await sdk.logs.showWorkflowLogs(workflowId, true);
        return;
    } catch (e) {
        console.log(`Could not retrieve logs due to error: ${e.message}`);
    }

    try {
        console.log('Checking build status...');
        const workflow = await sdk.workflows.get({ id: workflowId });
        const currentStatus = workflow.status;
        if (END_STATUSES.includes(currentStatus)) {
            console.log(`Build finished with status: '${_.upperCase(currentStatus)}'`);
            return;
        }
        console.log(`Current build status is: '${_.upperCase(currentStatus)}'`);
        consecutiveErrors = 0; // eslint-disable-line
    } catch (e) {
        if (!request.RetryStrategies.HTTPOrNetworkError(e, _.pick('statusCode'))) {
            throw e;
        }
        consecutiveErrors = (consecutiveErrors || 0) + 1; // eslint-disable-line
        if (consecutiveErrors > FIFTEEN_MINUTES / interval) {
            throw e;
        }
        console.log(`Could not get build status: ${e.message}.`);
        console.log('Retrying...');
    }

    await Promise.delay(interval);
    await _fallbackLogs(workflowId, interval, consecutiveErrors);
}

const followLogs = async (workflowId) => {
    try {
        await sdk.logs.showWorkflowLogs(workflowId, true);
    } catch (e) {
        if (!process.env.CF_CLI_RUN_WAIT_FALLBACK) {
            throw e;
        }
        console.log(`Could not retrieve logs due to error: ${e.message}`);
        await _fallbackLogs(workflowId, 10000);
    }
    const json = await sdk.workflows.get({ id: workflowId });
    const workflowInstance = Workflow.fromResponse(json);
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
};

module.exports = {
    followLogs,
    _fallbackLogs,
};
