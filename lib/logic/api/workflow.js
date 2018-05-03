const Promise = require('bluebird');
const _ = require('lodash');
const CFError = require('cf-errors'); // eslint-disable-line
const { sendHttpRequest } = require('./helper');
const Workflow = require('../entities/Workflow');
const moment = require('moment');
const endStatuses = ['error' , 'success' , 'terminated'];


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
        'pipeline-name': workflow.serviceName,
        repository: `${workflow.repoOwner}/${workflow.repoName}`,
        branch: workflow.branchName,
        trigger: workflow.trigger,
        progress: workflow.progress,
        'pipeline-Id': workflow.serviceId,
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
        pipeline: options.pipelineIds,
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


const restartWorkflowById = async (id) => {
    const options = {
        url: `/api/builds/rebuild/${id}`,
        method: 'GET',
    };
    const response = await sendHttpRequest(options);
    return response;
};

const terminateWorkflowById = async (id) => {
    const currWorkflow = await getWorkflowById(id);
    const options = {
        url: `/api/progress/${currWorkflow.info.progress}`,
        method: 'DELETE',
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
