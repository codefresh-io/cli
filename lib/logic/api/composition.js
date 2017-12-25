const _ = require('lodash');
const CFError = require('cf-errors'); // eslint-disable-line
const { sendHttpRequest } = require('./helper');
const Composition = require('../entities/Composition');


const _extractFieldsForCompositionwEntity = composition => ({
    id: composition._id,
    name: composition.name,
    isAdvanced: composition.isAdvanced,
    created: composition.created,
});


const createComposition = async (data) => {
    const options = {
        url: '/api/compositions/',
        method: 'POST',
        body: data,
    };

    return sendHttpRequest(options);
};

const replaceById = async (id, data) => {
    const body = data;

    const options = {
        url: `/api/compositions/${id}`,
        method: 'PUT',
        body,
    };

    return sendHttpRequest(options);
};

//  TODO:need to add to cf-api
const applyById = async (id, data) => {
    const body = data;

    const options = {
        url: `/api/compositions/${id}`,
        method: 'PATCH',
        body,
    };

    return sendHttpRequest(options);
};

const getCompositionByIdentifier = async (id) => {
    const options = {
        url: `/api/compositions/${id}`,
        method: 'GET',
    };

    const composition = await sendHttpRequest(options);
    const data = _extractFieldsForCompositionwEntity(composition);
    return new Composition(data);
};

const getCompositions = async () => {
    const userOptions = {
        url: '/api/compositions',
        method: 'GET',
    };

    const result = await sendHttpRequest(userOptions);
    const compositions = [];
    let data = {};
    _.forEach(result, (composition) => {
        data = _extractFieldsForCompositionwEntity(composition);
        compositions.push(new Composition(data));
    });

    return compositions;
};

const deleteCompositionById = async (id) => {
    const options = {
        url: `/api/compositions/${id}`,
        method: 'DELETE',
    };

    return sendHttpRequest(options);
};


module.exports = {
    createComposition,
    replaceById,
    applyById,
    getCompositionByIdentifier,
    getCompositions,
    deleteCompositionById,
};
