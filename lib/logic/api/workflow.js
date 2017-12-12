const _                   = require('lodash');
const CFError             = require('cf-errors');
const { sendHttpRequest } = require('./helper');
const Workflow               = require('../entities/Workflow');


const getWorkflowById = async (id) => {
    const options = {
        url: `/api/builds/${id}`,
        method: 'GET',
    };

    const result = await sendHttpRequest(options);
    return new Workflow(result);
};

const getWorkflows = async () => {
    const userOptions = {
        url: '/api/builds',
        method: 'GET',
    };

    const result = await sendHttpRequest(userOptions);
    const workflows = [];

    _.forEach(result, (composition) => {
        workflows.push(new Workflow(composition));
    });

    return workflows;
};


module.exports = {
    getWorkflowById,
    getWorkflows,
};