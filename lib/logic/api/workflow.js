const _                   = require('lodash');
const CFError             = require('cf-errors');
const { sendHttpRequest } = require('./helper');
const Workflow            = require('../entities/Workflow');
const moment              = require('moment');


const _extractFieldsForWorkflowEntity = (workflow) => {
    return {
        id: workflow.id,
        created: moment(workflow.created).fromNow(),
        status: workflow.status,
        service_Name: workflow.serviceName,
        repo_Owner: workflow.repoOwner,
        repo_Name: workflow.repoName,
        branch_Name: workflow.branchName,
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

//TODO: need to ask itai about the total - maybe there is a better way to get the total record without to do 2 http request
const getWorkflows = async () => {
    let userOptions = {
        url: '/api/workflow',
        method: 'GET',
    };
    let result = await sendHttpRequest(userOptions);
    const total = result.workflows.total;
    userOptions = {
        url: `/api/workflow/?limit=${total}`,
        method: 'GET',
    };
    result = await sendHttpRequest(userOptions);
    const workflows = [];
    let data = {};
    _.forEach(result.workflows.docs, (workflow) => {
        data = _extractFieldsForWorkflowEntity(workflow);
        workflows.push(new Workflow(data));
    });

    return workflows;
};




module.exports = {
    getWorkflowById,
    getWorkflows,
};