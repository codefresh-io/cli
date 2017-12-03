const _                   = require('lodash');
const CFError             = require('cf-errors');
const { sendHttpRequest } = require('./helper');

const createContext = async (data) => {
    const body  = data;
    const owner = data.owner;
    delete data.owner;

    const options = {
        url: `/api/contexts/${owner}`,
        method: 'POST',
        body,
    };

    return await sendHttpRequest(options);
};

const replaceContext = async (data) => {
    const body = data;

    delete data.owner;

    const options = {
        url: '/api/contexts/user',
        method: 'POST',
        body,
    };

    return await sendHttpRequest(options);
};

const applyContext = async (data) => {

};

const getContextByName = async (name) => {
    const accountOptions = {
        url: `/api/contexts/account/${name}`,
        method: 'GET',
    };

    const accountContext = await sendHttpRequest(accountOptions);

    const userOptions = {
        url: `/api/contexts/user/${name}`,
        method: 'GET',
    };

    const userContext = await sendHttpRequest(userOptions);

    if (accountContext) {
        return accountContext;
    } else {
        return userContext;
    }
};

const getContexts = async (data) => {
    const userOptions = {
        url: '/api/contexts',
        method: 'GET',
        qs: _.pick(data, 'owner', 'type'),
    };

    return await sendHttpRequest(userOptions);
};

const deleteContextByName = async (name) => {
    const userOptions = {
        url: `/api/contexts/user/${name}`,
        method: 'DELETE',
    };

    await sendHttpRequest(userOptions);

    const accountOptions = {
        url: `/api/contexts/account/${name}`,
        method: 'DELETE',
    };

    return await sendHttpRequest(accountOptions);
};

module.exports = {
    createContext,
    getContextByName,
    getContexts,
    deleteContextByName,
    replaceContext,
    applyContext,
};