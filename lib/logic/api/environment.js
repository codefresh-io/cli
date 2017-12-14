const _                   = require('lodash');
const CFError             = require('cf-errors');
const { sendHttpRequest } = require('./helper');
const Environment         = require('../entities/Environment');


//TODO:need to add to cf-api
const getEnvironmentById = async (id) => {
    const options = {
        url: `/api/environments/${id}`,
        method: 'GET',
    };

    const result = await sendHttpRequest(options);
    return new Environment(result);
};

const getEnvironments = async () => {
    const userOptions = {
        url: '/api/environments',
        method: 'GET',
    };

    const result = await sendHttpRequest(userOptions);
    const environments = [];

    _.forEach(result, (composition) => {
        environments.push(new Environment(composition));
    });

    return environments;
};

const deleteEnvironment = async (id) => {
    const userOptions = {
        url: `/api/environments/${id}/terminate`,
        method: 'GET',
    };

    return await sendHttpRequest(userOptions);
};


module.exports = {
    getEnvironmentById,
    getEnvironments,
    deleteEnvironment,
};