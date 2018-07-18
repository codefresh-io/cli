const _ = require('lodash');
const { sendHttpRequest } = require('./helper');
const RuntimeEnvironments = require('../entities/RuntimeEnvironments');


const _extractFieldsForRuntimeEnvironmentEntity = runtimeEnv => _.pick(runtimeEnv, '_id', 'version', 'metadata', 'environmentCertPath','runtimeScheduler','dockerDaemonScheduler','defaultUserProvidedCluster', 'history');


const getAllRuntimeEnvironments = async (options) => {
    const qs = {
        limit: options.limit,
        offset: options.offset,
    };

    const RequestOptions = {
        url: '/api/admin/runtime-environment-manager',
        method: 'GET',
        qs,
    };

    const result = await sendHttpRequest(RequestOptions);
    const runtimeEnvironments = [];
    _.forEach(result, (runtimeEnvironment) => {
        const data = _extractFieldsForRuntimeEnvironmentEntity(runtimeEnvironment);
        runtimeEnvironments.push(new RuntimeEnvironments(data));
    });

    return runtimeEnvironments;
};

const getRuntimeEvironmentsByName = async (option) => {
    const qs = {
        version: option.version,
        extend: option.extend,
    };
    const options = {
        url: `/api/admin/runtime-environment-manager/${encodeURIComponent(option.name)}`,
        method: 'GET',
        qs,
    };
    const runtimeEnvironments = await sendHttpRequest(options);
    const runtimeObj = new RuntimeEnvironments(_extractFieldsForRuntimeEnvironmentEntity(runtimeEnvironments));
    return runtimeObj;
};

const getRuntimeEnvironmentHistory = async (option) => {
    const qs = {
        history: true,
    };
    const options = {
        url: `/api/admin/runtime-environment-manager/${encodeURIComponent(option.name)}`,
        method: 'GET',
        qs,
    };
    const runtimeEnvironments = await sendHttpRequest(options);
    return runtimeEnvironments;
};

const replaceByName = async (body) => {
    const options = {
        url: '/api/admin/runtime-environment-manager',
        method: 'POST',
        body,
    };

    return sendHttpRequest(options);
};

const deleteRuntimeEnvironmentByName = async (runtimeEnvironmentName) => {
    const options = {
        url: `/api/admin/runtime-environment-manager/${encodeURIComponent(runtimeEnvironmentName)}`,
        method: 'DELETE',
    };

    return sendHttpRequest(options);
};



module.exports = {
    getRuntimeEvironmentsByName,
    getRuntimeEnvironmentHistory,
    replaceByName,
    getAllRuntimeEnvironments,
    deleteRuntimeEnvironmentByName,
};
