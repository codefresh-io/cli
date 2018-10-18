const _ = require('lodash'); // eslint-disable-line
const CFError = require('cf-errors');
const { sendHttpRequest } = require('./helper');
const Board = require('../entities/Board');
const { getContextByName } = require('./context');
const Promise = require('bluebird');

const _extractFieldsForBoardEntity = board => _.pick(board, '_id', 'name', 'type', 'filter');

const getAll = async (options) => {
    const RequestOptions = {
        url: '/api/helm/boards',
        method: 'GET',
    };

    const result = await sendHttpRequest(RequestOptions);
    const boards = [];
    _.forEach(result, (board) => {
        const data = _extractFieldsForBoardEntity(board);
        boards.push(new Board(data));
    });

    return boards;
};

const getBoardById = async (id) => {
    const RequestOptions = {
        url: `/api/helm/boards/${encodeURIComponent(id)}`,
        method: 'GET',
    };

    const result = await sendHttpRequest(RequestOptions);
    const data = _extractFieldsForBoardEntity(result);
    return new Board(data);
};

const getBoardByName = async (name) => {
    const RequestOptions = {
        url: `/api/helm/boards/ByName/${encodeURIComponent(name)}`,
        method: 'GET',
    };

    const result = await sendHttpRequest(RequestOptions);
    const data = _extractFieldsForBoardEntity(result);
    return new Board(data);
};

const createBoard = async (data) => {
    const options = {
        url: '/api/helm/boards',
        method: 'POST',
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
    getBoardById,
    getBoardByName,
    createBoard,
    // getPipelineByName,
    // createPipeline,
    // replaceByName,
    // patchPipelineByName,
    // deletePipelineByName,
    // runPipelineByName,
};
