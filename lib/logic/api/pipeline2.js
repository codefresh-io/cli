const _ = require('lodash'); // eslint-disable-line
const CFError = require('cf-errors'); // eslint-disable-line
const { sendHttpRequest } = require('./helper');
const Pipeline = require('../entities/Pipeline2');

const _extractFieldsForPipelineEntity = pipeline => _.pick(pipeline, 'id', 'kind', 'metadata', 'spec');

const getAll = async () => {
    const options = {
        url: '/api/pipelines/new',
        method: 'GET',
    };

    const result = await sendHttpRequest(options);
    const pipelines = [];
    _.forEach(result, (pipeline) => {
        const data = _extractFieldsForPipelineEntity(pipeline);
        pipelines.push(new Pipeline(data));
    });

    return pipelines;
};

const getPipelineByName = async (name) => {
    const options = {
        url: `/api/pipelines/new/${name}`,
        method: 'GET',
    };

    const result = await sendHttpRequest(options);
    const data = _extractFieldsForPipelineEntity(result);
    return new Pipeline(data);
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

const runPipelineByName = async (name, data) => {
    const body = _.pick(data, 'variables', 'branch');

    const options = {
        url: `/api/pipelines/new/run/${name}`,
        method: 'POST',
        body,
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
