const _ = require('lodash'); // eslint-disable-line
const { sendHttpRequest } = require('./helper');
const Board = require('../entities/Board');

const _extractFieldsForBoardEntity = board => _.pick(board, '_id', 'name', 'type', 'filter');

const getAll = async () => {
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
        url: `/api/helm/boards/name/${encodeURIComponent(name)}`,
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

const updateBoard = async (id, data) => {
    const options = {
        url: `/api/helm/boards/${id}`,
        method: 'PATCH',
        body: data,
    };

    return sendHttpRequest(options);
};

const deleteBoard = async (id) => {
    const options = {
        url: `/api/helm/boards/${id}`,
        method: 'DELETE',
    };

    return sendHttpRequest(options);
};

module.exports = {
    getAll,
    getBoardById,
    getBoardByName,
    createBoard,
    updateBoard,
    deleteBoard,
};
