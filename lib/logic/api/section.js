const _ = require('lodash'); // eslint-disable-line
const { sendHttpRequest } = require('./helper');
const Section = require('../entities/Section');

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

const deleteSection = async (id) => {
    const options = {
        url: `/api/helm/boards/sections/${id}`,
        method: 'DELETE',
    };

    return sendHttpRequest(options);
};

module.exports = {
    getAll,
    getSectionById,
    getSectionByName,
    createSection,
    updateSection,
    deleteSection,
};
