const _ = require('lodash');
const CFError = require('cf-errors'); // eslint-disable-line
const { sendHttpRequest } = require('./helper');
const Workflow = require('../entities/Workflow');
const moment = require('moment');


const _extractFieldsForWorkflowEntity = (workflow) => {
    const created = moment(workflow.created);
    const finished = moment(workflow.finished);
    const totalTime = moment.utc(finished.diff(created)).format('HH:mm:ss.SSS');

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

module.exports = {
    getWorkflowById,
    getWorkflows,
};
