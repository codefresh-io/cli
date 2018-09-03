const _ = require('lodash');
const { sendHttpRequest } = require('./helper');
const RuntimeEnvironments = require('../entities/RuntimeEnvironments');

const reType = {
    private: 'AccountRuntimeEnvironment',
    system: 'SystemRuntimeEnvironment',
    'system-plan': 'PlanRuntimeEnvironment',
};

const _extractFieldsForRuntimeEnvironmentEntity = runtimeEnv => _.pick(runtimeEnv, '_id', 'version', 'metadata', 'environmentCertPath','runtimeScheduler','dockerDaemonScheduler','defaultUserProvidedCluster', 'history', 'extends');

// Account
const getAllRuntimeEnvironmentsForAccount = async (options) => {
    const qs = {
        limit: options.limit,
        offset: options.offset,
    };

    const RequestOptions = {
        url: '/api/user/runtime-environment-manager',
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

const getRuntimeEvironmentsByNameForAccount = async (option) => {
    const qs = {
        version: option.version,
        extend: option.extend,
        history: option.history,
    };
    const options = {
        url: `/api/user/runtime-environment-manager/${encodeURIComponent(option.name)}`,
        method: 'GET',
        qs,
    };
    const runtimeEnvironments = await sendHttpRequest(options);
    const runtimeObj = option.diff ? runtimeEnvironments : new RuntimeEnvironments(_extractFieldsForRuntimeEnvironmentEntity(runtimeEnvironments));
    return runtimeObj;
};

const applyByNameForAccount = async (option) => {
    const { name, extend, accountInfra, body } = option;
    const qs = {
        extend: extend,
        accountInfra: accountInfra,
    };
    const options = {
        url: `/api/user/runtime-environment-manager/${encodeURIComponent(name)}`,
        method: 'PUT',
        qs,
        body,
    };

    return sendHttpRequest(options);
};

const deleteRuntimeEnvironmentByNameForAccount = async (name, force) => {
    const qs = {
        force,
    };
    const options = {
        url: `/api/user/runtime-environment-manager/${encodeURIComponent(name)}`,
        method: 'DELETE',
        qs,
    };

    return sendHttpRequest(options);
};

const setDefaultForAccount = async (name) => {
    const options = {
        url: `/api/user/runtime-environment-manager/default/${encodeURIComponent(name)}`,
        method: 'PUT',
    };

    return sendHttpRequest(options);
};

// Admin

const getAllRuntimeEnvironmentsForAdmin = async (option) => {
    const qs = {
        version: option.version,
        extend: option.extend,
    };
    const options = {
        url: '/api/admin/runtime-environment-manager',
        method: 'GET',
        qs,
    };
    const runtimeEnvironments = await sendHttpRequest(options);
    const runtimeObjectsArr = [];
    _.forEach(runtimeEnvironments , (runtimeEnvironment) => {
        runtimeObjectsArr.push(new RuntimeEnvironments(_extractFieldsForRuntimeEnvironmentEntity(runtimeEnvironment)));
    });
    return runtimeObjectsArr;
};

const getRuntimeEvironmentsByNameForAdmin = async (option) => {
    const qs = {
        version: option.version,
        extend: option.extend,
        history: option.history,
        successors: option.successors,
    };
    let url;
    if (_.isEqual(option.type , 'SystemRuntimeEnvironment')){
        url = `/api/admin/runtime-environment-manager/${encodeURIComponent(option.name)}`;
    } else {
        url = `/api/admin/runtime-environment-manager/${encodeURIComponent(option.plan)}/${encodeURIComponent(option.name)}`;
    }
    const options = {
        url: url,
        method: 'GET',
        qs,
    };
    const runtimeEnvironments = await sendHttpRequest(options);
    if (option.successors) {
        return runtimeEnvironments;
    }
    const runtimeObj = option.diff ? runtimeEnvironments : new RuntimeEnvironments(_extractFieldsForRuntimeEnvironmentEntity(runtimeEnvironments));
    return runtimeObj;
};

const applyByNameForAdmin = async (option) => {
    const { extend, body, name, plan, type } = option;
    const qs = {
        extend: extend,
    };
    let url;
    if (_.isEqual(type, 'SystemRuntimeEnvironment')) {
        url = `/api/admin/runtime-environment-manager/${encodeURIComponent(name)}`;
    } else {
        url = `/api/admin/runtime-environment-manager/${encodeURIComponent(plan)}/${encodeURIComponent(name)}`;
    }
    const options = {
        url: url,
        method: 'PUT',
        qs,
        body,
    };

    return sendHttpRequest(options);
};

const deleteRuntimeEnvironmentByNameForAdmin = async (option) => {
    const { name, plan, force } = option;
    const qs = {
        force,
    };
    let url;
    if (_.isEqual(option.type, 'SystemRuntimeEnvironment')) {
        url = `/api/admin/runtime-environment-manager/${encodeURIComponent(name)}`;
    } else {
        url = `/api/admin/runtime-environment-manager/${encodeURIComponent(plan)}/${encodeURIComponent(name)}`;
    }
    const options = {
        url: url,
        method: 'DELETE',
        qs,
    };

    return sendHttpRequest(options);
};

const setDefaultForAdmin = async (option) => {
    const { name, plan } = option;
    const options = {
        url: `/api/admin/runtime-environment-manager/default/${encodeURIComponent(plan)}/${encodeURIComponent(name)}`,
        method: 'PUT',
    };

    return sendHttpRequest(options);
};

const getRuntimeEnvironmentType = (runtimeEnvironmentName) => {
    if (runtimeEnvironmentName.startsWith('system-plan')) {
        return reType['system-plan'];
    } else if (runtimeEnvironmentName.startsWith('system-')) {
        return reType.system;
    } else {
        return reType.private;
    }
};


module.exports = {
    getAllRuntimeEnvironmentsForAccount,
    getRuntimeEvironmentsByNameForAccount,
    applyByNameForAccount,
    deleteRuntimeEnvironmentByNameForAccount,
    setDefaultForAccount,
    getAllRuntimeEnvironmentsForAdmin,
    getRuntimeEvironmentsByNameForAdmin,
    applyByNameForAdmin,
    deleteRuntimeEnvironmentByNameForAdmin,
    setDefaultForAdmin,
    getRuntimeEnvironmentType,
};
