const _ = require('lodash'); // eslint-disable-line
const CFError = require('cf-errors');
const { sendHttpRequest } = require('./helper');
const Pipeline = require('../entities/Pipeline');
const { getContextByName } = require('./context');
const Promise = require('bluebird');

const _extractFieldsForPipelineEntity = pipeline => _.pick(pipeline, 'id', 'version', 'kind', 'metadata', 'spec');

const getAll = async (options) => {
    const qs = {
        limit: options.limit,
        offset: options.offset,
        labels: options.labels,
    };

    if (options.name) {
        qs.id = options.name;
    }

    if (options.names) {
        qs.id = options.names;
    }

    const RequestOptions = {
        url: '/api/pipelines',
        method: 'GET',
        qs,
    };

    const result = await sendHttpRequest(RequestOptions);
    const pipelines = [];
    _.forEach(result.docs, (pipeline) => {
        const data = _extractFieldsForPipelineEntity(pipeline);
        pipelines.push(new Pipeline(data));
    });

    return pipelines;
};

const getPipelineByName = async (name, options = {}) => {
    const qs = {};

    if (options.decryptVariables) {
        qs.decryptVariables = true;
    }

    const RequestOptions = {
        url: `/api/pipelines/${encodeURIComponent(name)}`,
        method: 'GET',
        qs,
    };

    const result = await sendHttpRequest(RequestOptions);
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

const validateYaml = async (yaml) => {
    const optionsValidate = {
        url: '/api/pipelines/yaml/validator',
        method: 'POST',
        body: { yaml },
    };
    return sendHttpRequest(optionsValidate);
};

const replaceByName = async (name, data) => {
    const body = data;

    const options = {
        url: `/api/pipelines/${encodeURIComponent(name)}`,
        method: 'PUT',
        body,
    };

    return sendHttpRequest(options);
};

const deletePipelineByName = async (name) => {
    const options = {
        url: `/api/pipelines/${encodeURIComponent(name)}`,
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

    if (data.enableNotifications) {
        body.options.enableNotifications = data.enableNotifications;
    }

    if (data.resetVolume) {
        body.options.resetVolume = data.resetVolume;
    }

    if (data.sha) {
        body.sha = data.sha;
    }

    if (data.userYamlDescriptor) {
        body.userYamlDescriptor = data.userYamlDescriptor;
    }

    if (data.contexts) {
        let contexts = [];
        if (_.isString(data.contexts)) {
            contexts = [data.contexts];
        }
        await Promise.map(data.contexts, async (name) => { // eslint-disable-line
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
        url: `/api/pipelines/run/${encodeURIComponent(name)}`,
        method: 'POST',
        body,
    };

    return sendHttpRequest(options);
};

module.exports = {
    getAll,
    getPipelineByName,
    createPipeline,
    validateYaml,
    replaceByName,
    patchPipelineByName,
    deletePipelineByName,
    runPipelineByName,
};
