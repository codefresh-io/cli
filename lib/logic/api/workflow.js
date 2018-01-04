const Promise = require('bluebird');
const _ = require('lodash');
const CFError = require('cf-errors'); // eslint-disable-line
const { sendHttpRequest } = require('./helper');
const Workflow = require('../entities/Workflow');
const moment = require('moment');


const _extractFieldsForWorkflowEntity = (workflow) => {
    const created = moment(workflow.created);
    const finished = moment(workflow.finished);
    const totalTime = moment.utc(finished.diff(created))
        .format('HH:mm:ss.SSS');

    return {
        id: workflow.id,
        created: `${created.format('YYYY-MM-DD, hh:mm:ss')} (${created.fromNow()})`,
        finished: `${finished.format('YYYY-MM-DD, hh:mm:ss')}`,
        totalTime,
        status: workflow.status,
        pipeline: workflow.serviceName,
        repository: `${workflow.repoOwner}/${workflow.repoName}`,
        branch: workflow.branchName,
        trigger: workflow.trigger,
        progress: workflow.progress,
    };
};


const getWorkflowById = async (id) => {
    const options = {
        url: `/api/builds/${id}`,
        method: 'GET',
    };
    const workflow = await sendHttpRequest(options);
    const data = _extractFieldsForWorkflowEntity(workflow);
    return new Workflow(data);
};

// TODO: need to ask itai about the total - maybe there is a better way to get the total record without to do 2 http request
const getWorkflows = async (options) => {
    const qs = {
        limit: options.limit,
        page: options.page,
        status: options.status,
        trigger: options.trigger,
        service: options.pipelineIds,
    };

    const RequestOptions = {
        url: '/api/workflow',
        qs,
        method: 'GET',
    };
    const result = await sendHttpRequest(RequestOptions);
    const workflows = [];
    _.forEach(result.workflows.docs, (workflow) => {
        const data = _extractFieldsForWorkflowEntity(workflow);
        workflows.push(new Workflow(data));
    });

    return workflows;
};

const waitForStatus = async (workflowId, desiredStatus, timeoutDate, descriptive) => {
    const currentDate = moment();
    if (currentDate.isAfter(timeoutDate)) {
        throw new CFError('Operation has timed out');
    }

    const workflow = await getWorkflowById(workflowId);
    const currentStatus = workflow.getStatus();
    if (currentStatus !== desiredStatus) {
        if (descriptive) {
            console.log(`Workflow: ${workflowId} current status: ${currentStatus}`);
        }
        await Promise.delay(5000);
        await waitForStatus(workflowId, desiredStatus, timeoutDate, descriptive);
    } else {
        console.log(`Workflow: ${workflowId} status: ${desiredStatus} reached`);
    }
};


const restartWorkflowById = async (id) => {
    const body = {
        action: 'start',
    };
    const options = {
        url: `/api/workflow/${id}/event`,
        body,
        method: 'POST',
    };
    const response = await sendHttpRequest(options);
    return response;
};

const terminateWorkflowById = async (id) => {
    const body = {
        action: 'terminate',
    };
    const options = {
        url: `/api/workflow/${id}/event`,
        body,
        method: 'POST',
    };
    const response = await sendHttpRequest(options);
    return response;
};

module.exports = {
    getWorkflowById,
    getWorkflows,
    waitForStatus,
    restartWorkflowById,
    terminateWorkflowById,
};
