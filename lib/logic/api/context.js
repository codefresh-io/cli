const _                   = require('lodash');
const CFError             = require('cf-errors');
const { sendHttpRequest } = require('./helper');

const createUserContext = async (data) => {
    const body = data;

    delete data.owner;

    const options = {
        url: '/api/contexts/user',
        method: 'POST',
        body,
    };

    return await sendHttpRequest(options);
};

const createAccountContext = async (data) => {
    const body = data;

    delete data.owner;

    const options = {
        url: '/api/contexts/account',
        method: 'POST',
        body,
    };

    return await sendHttpRequest(options);
};

const replaceUserContext = async (data) => {
    const body = data;

    delete data.owner;

    const options = {
        url: '/api/contexts/user',
        method: 'POST',
        body,
    };

    return await sendHttpRequest(options);
};

const replaceAccountContext = async (data) => {
    const body = data;

    delete data.owner;

    const options = {
        url: '/api/contexts/account',
        method: 'POST',
        body,
    };

    return await sendHttpRequest(options);
};

const applyUserContext = async (data) => {

};

const applyAccountContext = async (data) => {

};

const getUserContextByName = async (name) => {
    const body = data;

    delete data.owner;

    const options = {
        url: '/api/contexts/user',
        method: 'GET',
        body,
    };

    return await sendHttpRequest(options);
};

const getAccountContextByName = async (name) => {
    const body = data;

    delete data.owner;

    const options = {
        url: '/api/contexts/account',
        method: 'GET',
        body,
    };

    return await sendHttpRequest(options);
};

const getAllUserContexts = async () => {

};

const getAllAccountContexts = async () => {

};

const deleteUserContextByName = async (name) => {
    const body = data;

    delete data.owner;

    const options = {
        url: '/api/contexts/user',
        method: 'DELETE',
        body,
    };

    return await sendHttpRequest(options);
};

const deleteAccountContextByName = async (name) => {
    const body = data;

    delete data.owner;

    const options = {
        url: '/api/contexts/account',
        method: 'POST',
        body,
    };

    return await sendHttpRequest(options);
};


module.exports = {
    createUserContext,
    createAccountContext,
    replaceUserContext,
    replaceAccountContext,
    applyUserContext,
    applyAccountContext,
    getUserContextByName,
    getAccountContextByName,
    getAllUserContexts,
    getAllAccountContexts,
    deleteUserContextByName,
    deleteAccountContextByName,
};