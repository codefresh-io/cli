const Promise = require('bluebird');
const _ = require('lodash');
const request = require('requestretry');

const { sdk } = require('../../../logic');
const Workflow = require('../../../logic/entities/Workflow');

const END_STATUSES = ['error', 'success', 'terminated'];

const config = require('../../../logic/cli-config/Manager').config();

async function _fallbackLogs(workflowId, interval, retriesLeft) {
    try {
        console.log('Retrying to retrieve logs...');
        await sdk.logs.showWorkflowLogs(workflowId, true);
        return;
    } catch (e) {
        console.log(`Could not retrieve logs due to error: ${e.message}`);
    }

    let failedToGetStatus = false;

    try {
        console.log('Checking build status...');
        const workflow = await sdk.workflows.get({ id: workflowId });
        const currentStatus = workflow.status;
        if (END_STATUSES.includes(currentStatus)) {
            console.log(`Build finished with status: '${_.upperCase(currentStatus)}'`);
            return;
        }
        console.log(`Current build status is: '${_.upperCase(currentStatus)}'`);
    } catch (e) {
        if (!request.RetryStrategies.HTTPOrNetworkError(e, _.pick('statusCode'))) {
            throw e;
        }

        failedToGetStatus = true;

        if (retriesLeft === 0) {
            throw e;
        }
        console.log(`Could not get build status: ${e.message}.`);
        console.log('Retrying...');
    }

    await Promise.delay(interval);
    await _fallbackLogs(workflowId, interval, failedToGetStatus ? retriesLeft - 1 : retriesLeft);
}

const followLogs = async (workflowId) => {
    try {
        await sdk.logs.showWorkflowLogs(workflowId, true);
    } catch (e) {
        if (!process.env.CF_CLI_RUN_WAIT_FALLBACK) {
            throw e;
        }
        console.log(`Could not retrieve logs due to error: ${e.message}`);
        await _fallbackLogs(workflowId, config.logs.fallback.interval, config.logs.fallback.maxAttempts);
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
