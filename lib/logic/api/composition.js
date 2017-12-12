const _                   = require('lodash');
const CFError             = require('cf-errors');
const { sendHttpRequest } = require('./helper');
const Composition               = require('../entities/Composition');

const createComposition = async (data) => {
    const options = {
        url: '/api/compositions/',
        method: 'POST',
        body: data,
    };

    return await sendHttpRequest(options);
};

const replaceById = async (id, data) => {
    const body = data;

    const options = {
        url: `/api/compositions/${id}`,
        method: 'PUT',
        body,
    };

    return await sendHttpRequest(options);
};

//TODO:need to add to cf-api
const applyById = async (id, data) => {
    const body = data;

    const options = {
        url: `/api/compositions/${id}`,
        method: 'PATCH',
        body,
    };

    return await sendHttpRequest(options);
};

const getCompositionById = async (id) => {
    const options = {
        url: `/api/compositions/${id}`,
        method: 'GET',
    };

    const result = await sendHttpRequest(options);
    return new Composition(result);
};

const getCompositions = async () => {
    const userOptions = {
        url: '/api/compositions',
        method: 'GET',
    };

    const result = await sendHttpRequest(userOptions);
    const compositions = [];

    _.forEach(result, (composition) => {
        compositions.push(new Composition(composition));
    });

    return compositions;
};

const deleteCompositionById = async (id) => {
    const options = {
        url: `/api/compositions/${id}`,
        method: 'DELETE',
    };

    return await sendHttpRequest(options);
};

module.exports = {
    createComposition,
    replaceById,
    applyById,
    getCompositionById,
    getCompositions,
    deleteCompositionById,
};