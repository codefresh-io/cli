require('debug')('codefresh:functional:functions:context');
const CFError = require('cf-errors');
const { context } = require('../../../logic/index').api;

//--------------------------------------------------------------------------------------------------
// Private
//--------------------------------------------------------------------------------------------------

//--------------------------------------------------------------------------------------------------
// Public
//--------------------------------------------------------------------------------------------------

const TYPE_CHOICES = [
    'config',
    'secret',
    'helm-repository',
    'helm-plain-text-values',
    'plain-yaml',
    'secret-yaml',
];

const getContext = async (name, decrypt = false) => {
    if (!name) {
        throw new CFError('Name must be provided');
    }

    try {
        return context.getContextByName(name, decrypt);
    } catch (err) {
        throw new CFError({
            cause: err,
            message: `get context ${name} failed.`,
        });
    }
};

const getAllContexts = async (type = null, decrypt = false) => {
    const data = { decrypt };
    if (type) {
        data.type = type;
    }

    try {
        return context.getContexts(data);
    } catch (err) {
        throw new CFError({
            cause: err,
            message: 'get contexts failed',
        });
    }
};


const createContext = async (name, type = null, envVarsDict = {}) => {
    if (!name) {
        throw new CFError('Name must be provided');
    }

    const data = {
        apiVersion: 'v1',
        kind: 'context',
        metadata: {
            name,
        },
        spec: {
            type,
            data: envVarsDict,
        },
    };

    if (!data.metadata.name || !data.spec.type) {
        throw new CFError('Name and type must be provided');
    }

    return context.createContext(data);
};

const deleteContext = async (name) => {
    if (!name) {
        throw new CFError('Name must be provided');
    }

    return context.deleteContextByName(name);
};

const applyContext = async (name, data) => {
    if (!name) {
        throw new CFError('Name must be provided');
    }

    try {
        await context.getContextByName(name);

        return context.applyByName(name, data);
    } catch (err) {
        if (err) {
            return context.createContext(data);
        }
        throw err;
    }
};

const replaceContext = async (name, newData) => {
    if (!name) {
        throw new CFError('Name must be provided');
    }

    return context.replaceByName(name, newData);
};


module.exports = {
    getContext,
    getAllContexts,
    createContext,
    deleteContext,
    applyContext,
    replaceContext,

    TYPE_CHOICES,
};
