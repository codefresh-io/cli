const Promise = require('bluebird');
const _ = require('lodash');
const sdk = require('../../../logic/sdk');
const Context = require('../../../logic/entities/Context');

const SUPPORTED_TYPES = [
    'yaml',
    'secret-yaml',
];

const normalizeValues = async (values = []) => {
    return Promise.reduce(values, async (normalized, name) => {
        let context;
        try {
            context = await sdk.contexts.get({ name });
            context = Context.fromResponse(context);
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
};

const normalizeSetValues = async (values = []) => {
    return Promise.reduce(values, async (normalized, givenValue) => {
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
};

module.exports = {
    normalizeValues,
    normalizeSetValues,
};
