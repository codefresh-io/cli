const _ = require('lodash');
const { sdk } = require('../../../../lib/logic');

const TYPES = {
    plan: 'PlanRuntimeEnvironment',
    system: 'SystemRuntimeEnvironment',
    account: 'AccountRuntimeEnvironment',
};

function resolveType(name) {
    if (!name) {
        return null;
    }
    if (name.startsWith('system/plan')) {
        return TYPES.plan;
    }
    if (name.startsWith('system/')) {
        return TYPES.system;
    }
    return TYPES.account;
}

function get(options) {
    const type = resolveType(options.name);

    if (type === TYPES.system) {
        return sdk.onPrem.runtimeEnvs.system.get(options);
    }
    return sdk.onPrem.runtimeEnvs.plan.get(options);
}

function list(options) {
    if (options.account) {
        return sdk.onPrem.runtimeEnvs.account.list(options);
    }
    return sdk.onPrem.runtimeEnvs.list(options);
}

function update(options, body) {
    const type = resolveType(options.name);

    if (type === TYPES.system) {
        return sdk.onPrem.runtimeEnvs.system.update(options, body);
    }
    return sdk.onPrem.runtimeEnvs.plan.update(options, body);
}

function deleteRe(options) {
    const type = resolveType(options.name);

    if (type === TYPES.system) {
        return sdk.onPrem.runtimeEnvs.system.delete(options);
    }
    return sdk.onPrem.runtimeEnvs.plan.delete(options);
}

function setDefault(options) {
    if (options.account) {
        return sdk.onPrem.runtimeEnvs.account.setDefault(options);
    }
    return sdk.onPrem.runtimeEnvs.plan.setDefault(options);
}

function types() {
    return _.cloneDeep(TYPES);
}

module.exports = {
    get,
    list,
    update,
    delete: deleteRe,
    setDefault,
    resolveType,
    types,
};
