const _ = require('lodash');
const { sendHttpRequest } = require('./helper');
const Pipeline = require('../entities/Pipeline');
const CFError = require('cf-errors');
const {
    getContextByName,
} = require('./context');
const Promise = require('bluebird');


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

/**
 * will return all pipelines by repository owner/name
 * @param repoOwner
 * @param repoName
 * @returns {Promise<*>}
 */
const getAllByRepo = async (options) => {
    const qs = {
        name: options.name,
        limit: options.limit,
        page: options.page - 1,
    };
    const RequestOptions = {
        url: `/api/services/${encodeURIComponent(options.repoOwner)}/${encodeURIComponent(options.repoName)}`,
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

    /* TODO:ask itai about this issue
    _.forEach(pipelines, (pipeline) => {
        delete pipeline.account;
    });
    return pipelines;
    */
};

/**
 * will a pipeline by its name and repository owner/name
 * @param name
 * @param repoOwner
 * @param repoName
 * @returns {Promise<*>}
 */
const getPipelineByNameAndRepo = async (name, repoOwner, repoName) => {
    const pipelines = await getAllByRepo({
        repoOwner,
        repoName,
    });
    const currPipeline = _.find(pipelines, pipeline => pipeline.info.name.toString() === name);

    if (!currPipeline) {
        throw new CFError(`Pipeline name: ${name} wasn't found under repository: ${repoOwner}/${repoName}`);
    } else {
        return currPipeline;
    }
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

    if (data.contexts) {
        if (_.isString(data.contexts)) {
            data.contexts = [data.contexts];
        }
        body.contexts = [];
        await Promise.map(data.contexts, async (name) => {
            try {
                await getContextByName(name);
                body.contexts.push({
                    name,
                });
            } catch (err) {
                throw new CFError(err, `Failed to verify context ${name} with error ${err.message}`);
            }
        });


        // body.contexts = _.map(data.contexts, (ctx) => {
        //     return {
        //         name: ctx,
        //     };
        // });
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
    getAllByRepo,
    getPipelineByNameAndRepo,
};
