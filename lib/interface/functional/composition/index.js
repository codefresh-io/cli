/* eslint-disable prefer-destructuring */
require('debug')('codefresh:functional:functions:composition');
const CFError = require('cf-errors');
const { composition } = require('../../../logic/index').api;


//--------------------------------------------------------------------------------------------------
// Private
//--------------------------------------------------------------------------------------------------

//--------------------------------------------------------------------------------------------------
// Public
//--------------------------------------------------------------------------------------------------

const getComposition = async (name) => {
    if (!name) {
        throw new CFError('Missing name of the composition');
    }

    return composition.getCompositionByIdentifier(name);
};

const getAllCompositions = async () => composition.getCompositions();

const createComposition = async (
    name,
    envVarsDict = {},
    yamlFilePath = null,
    isAdvanced = false,
) => {
    const data = {
        name,
        vars: envVarsDict,
        isAdvanced,
    };

    if (yamlFilePath) {
        data.yamlJson = yamlFilePath;
    }

    return composition.createComposition(data);
};

const deleteComposition = async (name) => {
    const currComposition = await composition.getCompositionByIdentifier(name);
    const id = currComposition ? currComposition.info.id : null;
    if (!id) {
        throw new CFError(`Cannot found composition: ${name}`);
    }
    return composition.deleteCompositionById(id);
};

const replaceComposition = async (name, newData) => {
    let id;

    if (!name) {
        throw new CFError('Missing name of the composition');
    }

    const currComposition = await composition.getCompositionByIdentifier(name);
    if (currComposition) {
        id = currComposition.info.id;
    }
    if (!id) {
        throw new CFError(`Cannot found composition: ${name}`);
    }

    return composition.replaceById(id, newData);
};


module.exports = {
    getComposition,
    getAllCompositions,
    createComposition,
    deleteComposition,
    replaceComposition,
};
