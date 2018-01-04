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
const OWNER_CHOICES = ['account', 'user'];

const getContext = async (name, owner = OWNER_CHOICES[0]) => {
    if (!name) {
        throw new CFError('Name must be provided');
    }

    try {
        return context.getContextByName(name, owner);
    } catch (err) {
        throw new CFError({
            cause: err,
            message: `get context ${name} failed.`,
        });
    }
};

const getAllContexts = async (type = null, owner = OWNER_CHOICES[0]) => {
    const data = {};
    if (type) {
        data.type = type;
    }
    if (owner) {
        data.owner = owner;
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


const createContext = async (name, type = null, owner = OWNER_CHOICES[0], envVarsDict = {}) => {
    if (!name) {
        throw new CFError('Name must be provided');
    }

    const data = {
        apiVersion: 'v1',
        kind: 'context',
        owner,
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

const deleteContext = async (name, owner = OWNER_CHOICES[0]) => {
    if (!name) {
        throw new CFError('Name must be provided');
    }

    return context.deleteContextByName(name, owner);
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
    OWNER_CHOICES,
};
