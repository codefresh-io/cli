const _ = require('lodash');
const { sendHttpRequest } = require('./helper');
const RuntimeEnvironments = require('../entities/RuntimeEnvironments');


const _extractFieldsForRuntimeEnvironmentEntity = runtimeEnv => _.pick(runtimeEnv, '_id', 'version', 'metadata', 'runtimeEnvironments', 'history');

const getRuntimeEvironmentsByName = async (option) => {
    const qs = {
        name: option.name,
        version: option.version,
    };
    const options = {
        url: '/api/admin/runtime-environment-manager/runtimeEnvironmentsName',
        method: 'GET',
        qs,
    };
    const runtimeEnvironments = await sendHttpRequest(options);
    const runtimeObj = new RuntimeEnvironments(_extractFieldsForRuntimeEnvironmentEntity(runtimeEnvironments));
    return runtimeObj;
};

const getRuntimeEvironmentsHistory = async (option) => {
    const qs = {
        name: option.name,
        history: true,
    };
    const options = {
        url: '/api/admin/runtime-environment-manager/runtimeEnvironmentsName',
        method: 'GET',
        qs,
    };
    const runtimeEnvironments = await sendHttpRequest(options);
    return runtimeEnvironments;
};

const getRuntimeEvironment = async (runtimeEnvironmentName) => {
    const options = {
        url: `/api/admin/runtime-environment-manager/runtimeEnvironment/${runtimeEnvironmentName}`,
        method: 'GET',
    };
    const runtimeEnvironment = await sendHttpRequest(options);
    return runtimeEnvironment;
};

const replaceByName = async (runtimeEnvironmentName, data) => {
    const body = data;

    const options = {
        url: `/api/admin/runtime-environment-manager/${runtimeEnvironmentName}`,
        method: 'POST',
        body,
    };

    return sendHttpRequest(options);
};


module.exports = {
    getRuntimeEvironmentsByName,
    getRuntimeEvironmentsHistory,
    replaceByName,
    getRuntimeEvironment,
};
