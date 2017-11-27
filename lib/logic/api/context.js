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

};

const replaceAccountContext = async (data) => {

};

const applyUserContext = async (data) => {

};

const applyAccountContext = async (data) => {

};

const getUserContextByName = async (name) => {

};

const getAccountContextByName = async (name) => {

};

const getAllUserContexts = async () => {

};

const getAllAccountContexts = async () => {

};

const deleteUserContextByName = async (name) => {

};

const deleteAccountContextByName = async (name) => {

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