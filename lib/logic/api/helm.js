const Promise = require('bluebird');
const _ = require('lodash');
const CFError = require('cf-errors'); // eslint-disable-line
const {
    sendHttpRequest,
} = require('./helper');
const {
    getContextByName,
} = require('./context');

const SUPPORTED_TYPES = [
    'yaml',
    'secret-yaml',
];


const _normalizeValues = async (values = []) => {
    const normalizedValues = await Promise.reduce(values, async (normalized, name) => {
        let context;
        try {
            context = await getContextByName(name);
        } catch (err) {
            console.log(`Failed to get context: ${err.message}`);
            throw err;
        }
        const type = context.getType();
        if (_.includes(SUPPORTED_TYPES, type)) {
            normalized.push({
                name,
            });
        } else {
            console.log(`${name} has type ${type} which not supported, skipping`);
        }
        return normalized;
    }, []);

    return normalizedValues;
};

const _normalizeSetValues = async (values = []) => {
    const normalizedValues = await Promise.reduce(values, async (normalized, givenValue) => {
        const [key, value] = givenValue.split('=');
        if (!key || !value) {
            throw new Error('Passed set value must be in format KEY=VALUE');
        }
        const setObject = {
            key,
            value,
        };
        normalized.push(setObject);
        return normalized;
    }, []);

    return normalizedValues;
};

const installChart = async ({
    cluster,
    namespace,
    name,
    repository,
    version,
    values,
    releaseName,
    tillerNamespace,
    setValues,
}) => {
    let normalizedValues = [];
    if (values && _.isArray(values) && values.length > 0) {
        normalizedValues = await _normalizeValues(values);
    }

    const normalizedSetValues = await _normalizeSetValues(setValues);
    const options = {
        url: '/api/kubernetes/chart/install',
        method: 'POST',
        qs: {
            selector: cluster,
            tillerNamespace,
        },
        body: {
            name,
            repository,
            namespace,
            values: normalizedValues,
            version,
            releaseName,
            set: normalizedSetValues,
        },
    };

    const res = await sendHttpRequest(options);
    return res.id;
};

const testRelease = async ({
    releaseName,
    cluster,
    cleanup,
    timeout,
}) => {
    const options = {
        url: `/api/kubernetes/releases/${releaseName}/test`,
        method: 'POST',
        qs: {
            selector: cluster,
        },
        body: {
            cleanup,
            timeout,
        },
    };

    const res = await sendHttpRequest(options);
    return res.id;
};

const deleteRelease = async ({
    releaseName,
    cluster,
    timeout,
    purge,
    noHooks,
}) => {
    const options = {
        url: `/api/kubernetes/releases/${releaseName}/delete`,
        method: 'POST',
        qs: {
            selector: cluster,
        },
        body: {
            purge,
            noHooks,
            timeout,
        },
    };

    const res = await sendHttpRequest(options);
    return res.id;
};

module.exports = {
    installChart,
    testRelease,
    deleteRelease,
};
