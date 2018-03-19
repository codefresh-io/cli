const _ = require('lodash');
const CFError = require('cf-errors'); // eslint-disable-line
const { sendHttpRequest } = require('./helper');
const Environment = require('../entities/Environment');

const _getServiceInfo = (environment) => {
    let services = [];
    for (let i=0 ; i<environment.instances.length; i++){
        const service = environment.instances[i];
        services.push({
            serviceName: service.serviceName,
            image: service.image,
            sha: service.sha,
            branch: service.branch,
            repoName: service.repoName,
            serviceURL: service.urls,
        });
    };
    return services;
};

const _extractFieldsForEnvironmentEntity = (environment) => {
    return {
        id: environment._id,
        status: environment.creationStatus,
        name: environment.name,
        servicesInfo: _getServiceInfo(environment),
    };
};

const getEnvironmentById = async (id) => {
    const endcodeUri = encodeURIComponent(id);
    const options = {
        url: `/api/environments/${endcodeUri}`,
        method: 'GET',
    };

    const environment = await sendHttpRequest(options);
    const data = _extractFieldsForEnvironmentEntity(environment);
    return new Environment(data);
};

const getEnvironments = async () => {
    const userOptions = {
        url: '/api/environments',
        method: 'GET',
    };

    const result = await sendHttpRequest(userOptions);
    const environments = [];

    _.forEach(result, (environment) => {
        const data = _extractFieldsForEnvironmentEntity(environment);
        environments.push(new Environment(data));
    });

    return environments;
};

const deleteEnvironment = async (id) => {
    const userOptions = {
        url: `/api/environments/${id}/terminate`,
        method: 'GET',
    };

    return sendHttpRequest(userOptions);
};


module.exports = {
    getEnvironmentById,
    getEnvironments,
    deleteEnvironment,
};
