require('debug')('codefresh:functional:functions:environment');
const CFError = require('cf-errors');
const { environment } = require('../../../logic/index').api;


//--------------------------------------------------------------------------------------------------
// Private
//--------------------------------------------------------------------------------------------------

//--------------------------------------------------------------------------------------------------
// Public
//--------------------------------------------------------------------------------------------------

const getEnvironment = async (environmentId) => {
    if (!environmentId) {
        throw new CFError('environmentId must be provided');
    }

    try {
        return environment.getEnvironmentById(environmentId);
    } catch (err) {
        throw new CFError({
            cause: err,
            message: `get environment ${environmentId} failed.`,
        });
    }
};

const getAllEnvironments = async () => environment.getEnvironments();

const deleteEnvironment = async (environmentId) => {
    if (!environmentId) {
        throw new CFError('environmentId must be provided');
    }
    return environment.deleteEnvironment(environmentId);
};


module.exports = {
    getEnvironment,
    getAllEnvironments,
    deleteEnvironment,
};
