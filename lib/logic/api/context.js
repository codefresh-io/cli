const _                   = require('lodash');
const CFError             = require('cf-errors');
const { sendHttpRequest } = require('./helper');

const createContext = async (data) => {
    const options = {
        url: '/api/contexts/',
        method: 'POST',
        body: data,
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

const deleteContextByName = async (name, owner) => {
    const options = {
        url: `/api/contexts/${name}`,
        method: 'DELETE',
        body: {owner}
    };

    return await sendHttpRequest(options);
};

module.exports = {
    createContext,
    getContextByName,
    getContexts,
    deleteContextByName,
    replaceContext,
    applyContext,
};