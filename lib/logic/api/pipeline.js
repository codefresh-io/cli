const _ = require('lodash');
const { sendHttpRequest } = require('./helper');
const Pipeline = require('../entities/Pipeline');


const _extractFieldsForPipelineEntity = pipeline => ({
    id: pipeline._id,
    name: pipeline.name,
    imageName: pipeline.imageName,
    repoOwner: pipeline.repoOwner,
    repoName: pipeline.repoName,
});


const getAll = async (options) => {
    let qs = {};
    if (options) {
        qs = {
            name: options.name,
            limit: options.limit,
            page: options.page - 1,
            repoOwner: options.repoOwner,
            repoName: options.repoName,
        };
    }
    const RequestOptions = {
        url: '/api/pipelines',
        qs,
        method: 'GET',
    };

    const result = await sendHttpRequest(RequestOptions);
    const pipelines = [];

    _.forEach(result, (pipeline) => {
        const data = _extractFieldsForPipelineEntity(pipeline);
        pipelines.push(new Pipeline(data));
    });

    return pipelines;
};


const getPipelineById = async (id) => {
    const options = {
        url: `/api/pipelines/${id}`,
        method: 'GET',
    };

    const pipeline = await sendHttpRequest(options);
    const data = _extractFieldsForPipelineEntity(pipeline);
    return new Pipeline(data);
};

/**
 * will run a pipeline by its id
 * @param id
 * @returns {Promise<*>}
 */
const runPipelineById = async (id, data = {}) => {
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

    const options = {
        url: `/api/builds/${id}`,
        method: 'POST',
        body,
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
const patchPipelineById = async (id, pipeline) => {
    const options = {
        url: `/api/pipelines/${id}`,
        method: 'PATCH',
        body: pipeline,
    };

    return sendHttpRequest(options);
};

const patchPipelineByNameAndRepo = async (name, repoOwner, repoName, pipeline) => {
    const options = {
        url: `/api/services/${encodeURIComponent(repoOwner)}/${encodeURIComponent(repoName)}/${encodeURIComponent(name)}`,
        method: 'PATCH',
        body: pipeline,
    };

    return sendHttpRequest(options);
};


module.exports = {
    runPipelineById,
    patchPipelineById,
    patchPipelineByNameAndRepo,
    getPipelineById,
    getAll,
};
