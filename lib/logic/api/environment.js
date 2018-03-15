const _ = require('lodash');
const CFError = require('cf-errors'); // eslint-disable-line
const { sendHttpRequest } = require('./helper');
const Environment = require('../entities/Environment');

const _extractFieldsForEnvironmentEntity = (environment, service,exportInstance) => {
    let serviceURL = '';
    if (exportInstance) {
        serviceURL = exportInstance.http.public;
    }
    return {
        id: environment._id,
        status: environment.creationStatus,
        name: environment.name,
        serviceName: service.serviceName,
        image: service.image.substring(0, 20),
        sha: service.sha ? service.sha.substring(0, 8) : '',
        branch: service.branch,
        repoName: service.repoName,
        serviceURL: serviceURL,
    };
};


const _extractEnvironment = (environment) => {
    const res = [];
    _.forEach(environment.instances, (service) => {
        if (service.urls.run) {
            _.forEach(service.urls.run, (exportInstance) => {
                const data = _extractFieldsForEnvironmentEntity(environment, service, exportInstance);
                res.push(new Environment(data));
            });
        }
        else{
            const data = _extractFieldsForEnvironmentEntity(environment, service);
            res.push(new Environment(data));
        }
    });
    return res;
};

const getEnvironmentById = async (id) => {
    const endcodeUri = encodeURIComponent(id);
    const options = {
        url: `/api/environments/${endcodeUri}`,
        method: 'GET',
    };

    let result = await sendHttpRequest(options);
    if (!_.isArray(result)) {
        result = [result];
    }
    let environments = [];

    _.forEach(result, (environment) => {
        environments = environments.concat(_extractEnvironment(environment));
    });
    return environments;
};

const getEnvironments = async () => {
    const userOptions = {
        url: '/api/environments',
        method: 'GET',
    };

    const result = await sendHttpRequest(userOptions);
    let environments = [];

    _.forEach(result, (environment) => {
        environments = environments.concat(_extractEnvironment(environment));
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
