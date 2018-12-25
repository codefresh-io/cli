const _ = require('lodash');
const { sendHttpRequest } = require('./helper');
const RuntimeEnvironments = require('../entities/RuntimeEnvironments');

const _extractFieldsForRuntimeEnvironmentEntity = runtimeEnv => _.pick(runtimeEnv, 'version', 'metadata', 'environmentCertPath', 'runtimeScheduler', 'dockerDaemonScheduler', 'history', 'extends', 'description', 'isPublic', 'isDefault', 'accountId', 'plan', 'accounts', 'nonComplete');

// Account
const getAllRuntimeEnvironmentsForAccount = async (options) => {
    const qs = {
        limit: options.limit,
        offset: options.offset,
    };

    const RequestOptions = {
        url: '/api/runtime-environments',
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
        url: `/api/runtime-environments/${encodeURIComponent(option.name)}`,
        method: 'GET',
        qs,
    };
    const runtimeEnvironments = await sendHttpRequest(options);
    if (option.diff) {
        return runtimeEnvironments;
    } else if (option.history) {
        const history = [];
        _.forEach(runtimeEnvironments, (runtimeEnvironment) => {
            history.push(_extractFieldsForRuntimeEnvironmentEntity(runtimeEnvironment));
        });
        return history;
    }
    return new RuntimeEnvironments(_extractFieldsForRuntimeEnvironmentEntity(runtimeEnvironments));
};

const applyByNameForAccount = async (option) => {
    const { name, extend, body, description } = option;
    const qs = {
        extend: extend,
        description: description,
    };
    const options = {
        url: `/api/runtime-environments/${encodeURIComponent(name)}`,
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
        url: `/api/runtime-environments/${encodeURIComponent(name)}`,
        method: 'DELETE',
        qs,
    };

    return sendHttpRequest(options);
};

const setDefaultForAccount = async (name) => {
    const options = {
        url: `/api/runtime-environments/default/${encodeURIComponent(name)}`,
        method: 'PUT',
    };

    return sendHttpRequest(options);
};

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

const createHybridRuntimeWithAgent = (opt = {}) => {
    const url = 'api/custom_clusters/register';
    const options = {
        url,
        method: 'POST',
        qs: {
            agent: true,
        },
        body: opt,
    };

    return sendHttpRequest(options);
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
    createHybridRuntimeWithAgent,
};
