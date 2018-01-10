const _ = require('lodash'); // eslint-disable-line
const CFError = require('cf-errors'); // eslint-disable-line
const { sendHttpRequest } = require('./helper');
const Pipeline = require('../entities/Pipeline2');

const getAll = async () => {
    const options = {
        url: '/api/pipelines/new',
        method: 'GET',
    };

    const pipelines = await sendHttpRequest(options);
    return pipelines.map(p => new Pipeline(p));
};

const getPipelineByName = async (name) => {
    const options = {
        url: `/api/pipelines/new/${name}`,
        method: 'GET',
    };

    const pipeline = await sendHttpRequest(options);
    return new Pipeline(pipeline);
};

const createPipeline = async (data) => {
    const options = {
        url: '/api/pipelines/new',
        method: 'POST',
        body: data,
    };

    return sendHttpRequest(options);
};

const replaceByName = async (name, data) => {
    const body = data;

    const options = {
        url: `/api/pipelines/new/${name}`,
        method: 'PUT',
        body,
    };

    return sendHttpRequest(options);
};

const deletePipelineByName = async (name) => {
    const options = {
        url: `/api/pipelines/new/${name}`,
        method: 'DELETE',
    };

    return sendHttpRequest(options);
};

const runPipelineByName = async (name) => {
    const options = {
        url: `/api/pipelines/new/run/${name}`,
        method: 'POST',
    };

    return sendHttpRequest(options);
};

module.exports = {
    getAll,
    getPipelineByName,
    createPipeline,
    replaceByName,
    deletePipelineByName,
    runPipelineByName,
};
