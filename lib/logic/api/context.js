const _                   = require('lodash');
const CFError             = require('cf-errors');
const { sendHttpRequest } = require('./helper');
const Context               = require('../entities/Context');

const createContext = async (data) => {
    const options = {
        url: '/api/contexts/',
        method: 'POST',
        body: data,
    };

    return await sendHttpRequest(options);
};

const replaceByName = async (name, data) => {
    const body = data;

    const options = {
        url: `/api/contexts/${name}`,
        method: 'PUT',
        body,
    };

    return await sendHttpRequest(options);
};

const applyByName = async (name, data) => {
    const body = data;

    const options = {
        url: `/api/contexts/${name}`,
        method: 'PATCH',
        body,
    };

    return await sendHttpRequest(options);
};

const getContextByName = async (name, owner) => {
    const options = {
        url: `/api/contexts/${name}`,
        method: 'GET',
        qs: { owner },
    };

    const result = await sendHttpRequest(options);
    return new Context(result);
};

const getContexts = async (data) => {
    const userOptions = {
        url: '/api/contexts',
        method: 'GET',
        qs: _.pick(data, 'owner', 'type'),
    };

    const result = await sendHttpRequest(userOptions);
    const contexts = [];

    _.forEach(result, (context) => {
        contexts.push(new Context(context));
    });

    return contexts;
};

const deleteContextByName = async (name, owner) => {
    const options = {
        url: `/api/contexts/${name}`,
        method: 'DELETE',
        body: { owner },
    };

    return await sendHttpRequest(options);
};

module.exports = {
    createContext,
    getContextByName,
    getContexts,
    deleteContextByName,
    replaceByName,
    applyByName,
};