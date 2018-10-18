const _ = require('lodash'); // eslint-disable-line
const CFError = require('cf-errors');
const { sendHttpRequest } = require('./helper');
const Section = require('../entities/Section');
const { getContextByName } = require('./context');
const Promise = require('bluebird');

const _extractFieldsForSectionEntity = section => _.pick(section, '_id', 'name', 'boardId', 'section');

const getAll = async (options) => {
    const { boardId } = options;
    const RequestOptions = {
        url: `/api/helm/boards/sections?boardId=${boardId}`,
        method: 'GET',
    };

    const result = await sendHttpRequest(RequestOptions);
    const sections = [];
    _.forEach(result, (section) => {
        const data = _extractFieldsForSectionEntity(section);
        sections.push(new Section(data));
    });

    return sections;
};

const getSectionById = async (id) => {
    const RequestOptions = {
        url: `/api/helm/boards/sections/${encodeURIComponent(id)}`,
        method: 'GET',
    };

    const result = await sendHttpRequest(RequestOptions);
    const data = _extractFieldsForSectionEntity(result);
    return new Section(data);
};

const getSectionByName = async ({ boardId, name }) => {
    if (!boardId) {
        throw Error('boardId not specified');
    }

    const RequestOptions = {
        url: `/api/helm/boards/sections/${encodeURIComponent(boardId)}/${encodeURIComponent(name)}`,
        method: 'GET',
    };

    const result = await sendHttpRequest(RequestOptions);
    const data = _extractFieldsForSectionEntity(result);
    return new Section(data);
};

const createSection = async (data) => {
    const options = {
        url: '/api/helm/boards/sections',
        method: 'POST',
        body: data,
    };

    return sendHttpRequest(options);
};

const updateSection = async (id, data) => {
    const options = {
        url: `/api/helm/boards/sections/${id}`,
        method: 'PATCH',
        body: data,
    };

    return sendHttpRequest(options);
};


// const replaceByName = async (name, data) => {
//     const body = data;
//
//     const options = {
//         url: `/api/pipelines/${encodeURIComponent(name)}`,
//         method: 'PUT',
//         body,
//     };
//
//     return sendHttpRequest(options);
// };
//
// const deletePipelineByName = async (name) => {
//     const options = {
//         url: `/api/pipelines/${encodeURIComponent(name)}`,
//         method: 'DELETE',
//     };
//
//     return sendHttpRequest(options);
// };
//
// /**
//  * will update a pipeline with only changes that were passed
//  * @param name
//  * @param repoOwner
//  * @param repoName
//  * @returns {Promise<*>}
//  */
// const patchPipelineByName = async () => {
//     // TODO
//     throw new Error('not implemented');
// };
//
// /**
//  * will run a pipeline by its id
//  * @param id
//  * @returns {Promise<*>}
//  */
// const runPipelineByName = async (name, data) => {
//     const body = {
//         options: {},
//     };
//
//     if (data.branch) {
//         body.branch = data.branch;
//     }
//
//     if (data.variables) {
//         body.variables = data.variables;
//     }
//
//     if (data.noCache) {
//         body.options.noCache = data.noCache;
//     }
//
//     if (data.enableNotifications) {
//         body.options.enableNotifications = data.enableNotifications;
//     }
//
//     if (data.resetVolume) {
//         body.options.resetVolume = data.resetVolume;
//     }
//
//     if (data.sha) {
//         body.sha = data.sha;
//     }
//
//     if (data.contexts) {
//         let contexts = [];
//         if (_.isString(data.contexts)) {
//             contexts = [data.contexts];
//         }
//         await Promise.map(data.contexts, async (name) => { // eslint-disable-line
//             try {
//                 await getContextByName(name);
//                 contexts.push({
//                     name,
//                 });
//             } catch (err) {
//                 throw new CFError(err, `Failed to verify context ${name} with error ${err.message}`);
//             }
//         });
//         body.contexts = contexts;
//     }
//
//     const options = {
//         url: `/api/pipelines/run/${encodeURIComponent(name)}`,
//         method: 'POST',
//         body,
//     };
//
//     return sendHttpRequest(options);
// };

module.exports = {
    getAll,
    getSectionById,
    getSectionByName,
    createSection,
    updateSection,
    // getPipelineByName,
    // createPipeline,
    // replaceByName,
    // patchPipelineByName,
    // deletePipelineByName,
    // runPipelineByName,
};
