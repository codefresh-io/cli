const _ = require('lodash');
const { sendHttpRequest } = require('./helper');
const RuntimeEnvironments = require('../entities/RuntimeEnvironments');

const _extractFieldsForRuntimeEnvironmentEntity = runtimeEnv => _.pick(runtimeEnv, 'version', 'metadata', 'environmentCertPath', 'runtimeScheduler', 'dockerDaemonScheduler', 'history', 'extends', 'description', 'isPublic', 'isDefault', 'accountId', 'plan', 'accounts', 'nonComplete');

// Admin

const getAllRuntimeEnvironmentsForAdmin = async (option) => {
    const qs = {
        limit: option.limit,
        offset: option.offset,
        accountIds: option.accountIds,
    };
    let options;
    if (option.account) {
        options = {
            url: `/api/admin/runtime-environments/account/${option.account}`,
            method: 'GET',
            qs,
        };

    } else {
        options = {
            url: '/api/admin/runtime-environments',
            method: 'GET',
            qs,
        };
    }
    const runtimeEnvironments = await sendHttpRequest(options);
    const runtimeObjectsArr = [];
    _.forEach(runtimeEnvironments, (runtimeEnvironment) => {
        if (option.accountIds) {
            const accountRuntimeEnvironments = runtimeEnvironment.runtimeEnvironments;
            _.forEach(accountRuntimeEnvironments, (currRuntimeEnvironment) => {
                runtimeObjectsArr.push(new RuntimeEnvironments(_extractFieldsForRuntimeEnvironmentEntity(currRuntimeEnvironment)));
            });
        } else {
            runtimeObjectsArr.push(new RuntimeEnvironments(_extractFieldsForRuntimeEnvironmentEntity(runtimeEnvironment)));
        }
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
    if (_.isEqual(option.type, 'SystemRuntimeEnvironment')) {
        url = `/api/admin/runtime-environments/${encodeURIComponent(option.name)}`;
    } else {
        url = `/api/admin/runtime-environments/${encodeURIComponent(option.plan)}/${encodeURIComponent(option.name)}`;
    }
    const options = {
        url: url,
        method: 'GET',
        qs,
    };
    const runtimeEnvironments = await sendHttpRequest(options);
    if (option.successors || option.history) {
        return runtimeEnvironments;
    }
    const runtimeObj = option.diff ? runtimeEnvironments : new RuntimeEnvironments(_extractFieldsForRuntimeEnvironmentEntity(runtimeEnvironments));
    return runtimeObj;
};

const applyByNameForAdmin = async (option) => {
    const { extend, body, name, plan, type, description } = option;
    let url;
    let qs;
    if (_.isEqual(type, 'SystemRuntimeEnvironment')) {
        qs = {
            extend,
            description,
            plan,
        };
        url = `/api/admin/runtime-environments/${encodeURIComponent(name)}`;
    } else {
        qs = {
            extend,
            description,
        };
        url = `/api/admin/runtime-environments/${encodeURIComponent(plan)}/${encodeURIComponent(name)}`;
    }
    const options = {
        url,
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
        url = `/api/admin/runtime-environments/${encodeURIComponent(name)}`;
    } else {
        url = `/api/admin/runtime-environments/${encodeURIComponent(plan)}/${encodeURIComponent(name)}`;
    }
    const options = {
        url: url,
        method: 'DELETE',
        qs,
    };

    return sendHttpRequest(options);
};

const setDefaultForAdmin = async (option) => {
    const { name, plan, account } = option;
    let options;
    if (account) {
        options = {
            url: `/api/admin/runtime-environments/account/default/${encodeURIComponent(account)}/${encodeURIComponent(name)}`,
            method: 'PUT',
        };
    } else {
        options = {
            url: `/api/admin/runtime-environments/default/${encodeURIComponent(plan)}/${encodeURIComponent(name)}`,
            method: 'PUT',
        };
    }
    return sendHttpRequest(options);
};

const getRuntimeEnvironmentType = (runtimeEnvironmentName) => {
    if (runtimeEnvironmentName.startsWith('system/plan')) {
        return 'PlanRuntimeEnvironment';
    } else if (runtimeEnvironmentName.startsWith('system/')) {
        return 'SystemRuntimeEnvironment';
    } else {
        return 'AccountRuntimeEnvironment';
    }
};


module.exports = {
    getAllRuntimeEnvironmentsForAdmin,
    getRuntimeEvironmentsByNameForAdmin,
    applyByNameForAdmin,
    deleteRuntimeEnvironmentByNameForAdmin,
    setDefaultForAdmin,
    getRuntimeEnvironmentType,
};
