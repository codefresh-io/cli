const Promise = require('bluebird');
const _ = require('lodash');
const CFError = require('cf-errors'); // eslint-disable-line
const {
    sendHttpRequest
} = require('./helper');
const {
    getContextByName
} = require('./context');

const SUPPORTED_TYPES = [
    'yaml',
    'secret-yaml',
];


const _normalizeValues = async(values = []) => {
    const normalizedValues = await Promise.reduce(values, async(normalized, name) => {
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

const installChart = async({
    cluster,
    namespace,
    name,
    repository,
    version,
    values,
    releaseName,
    tillerNamespace,
}) => {
    const normalizedValues = await _normalizeValues(values);
    const options = {
        url: '/api/kubernetes/chart/install',
        method: 'POST',
        qs: {
            selector: cluster,
            namespace: tillerNamespace,
        },
        body: {
            name,
            repository,
            namespace,
            values: normalizedValues,
            version,
            releaseName,
        },
    };

    const res = await sendHttpRequest(options);
    return res.id;
};

const testRelease = async({
    releaseName,
    cluster,
    cleanup,
    timeout,
}) => {
    const options = {
        url: `/api/kubernetes/release/test/${releaseName}`,
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

module.exports = {
    installChart,
    testRelease,
};