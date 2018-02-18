const _ = require('lodash'); // eslint-disable-line
const CFError = require('cf-errors'); // eslint-disable-line
const { sendHttpRequest } = require('./helper');
const Pipeline = require('../entities/Pipeline');
const CFError = require('cf-errors');
const { getContextByName } = require('./context');
const Promise = require('bluebird');

const _extractFieldsForPipelineEntity = pipeline => _.pick(pipeline, 'id', 'kind', 'metadata', 'spec');

const getAll = async () => {
    const options = {
        url: '/api/pipelines',
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
        url: `/api/pipelines/${name}`,
        method: 'GET',
    };

    const result = await sendHttpRequest(options);
    const data = _extractFieldsForPipelineEntity(result);
    return new Pipeline(data);
};

const createPipeline = async (data) => {
    const options = {
        url: '/api/pipelines',
        method: 'POST',
        body: data,
    };

    return sendHttpRequest(options);
};

const replaceByName = async (name, data) => {
    const body = data;

    const options = {
        url: `/api/pipelines/${name}`,
        method: 'PUT',
        body,
    };

    return sendHttpRequest(options);
};

const deletePipelineByName = async (name) => {
    const options = {
        url: `/api/pipelines/${name}`,
        method: 'DELETE',
    };

    return sendHttpRequest(options);
};

/**
 * will update a pipeline with only changes that were passed
 * @param name
 * @param repoOwner
 * @param repoName
 * @returns {Promise<*>}
 */
const patchPipelineByName = async () => {
    // TODO
    throw new Error('not implemented');
};

/**
 * will run a pipeline by its id
 * @param id
 * @returns {Promise<*>}
 */
const runPipelineByName = async (name, data) => {
    const body = {
        options: {},
    };

    if (data.branch) {
        body.branch = data.branch;
    }

    if (data.variables) {
        body.variables = data.variables;
    }

    if (data.noCache) {
        body.options.noCache = data.noCache;
    }

    if (data.resetVolume) {
        body.options.resetVolume = data.resetVolume;
    }

    if (data.sha) {
        body.sha = data.sha;
    }

    if (data.contexts) {
        let contexts = [];
        if (_.isString(data.contexts)) {
            contexts = [data.contexts];
        }
        await Promise.map(data.contexts, async (name) => {
            try {
                await getContextByName(name);
                contexts.push({
                    name,
                });
            } catch (err) {
                throw new CFError(err, `Failed to verify context ${name} with error ${err.message}`);
            }
        });
        body.contexts = contexts;
    }

    const options = {
        url: `/api/builds/${name}`,
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
    patchPipelineByName,
    deletePipelineByName,
    runPipelineByName,
};
