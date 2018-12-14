const { sendHttpRequest } = require('./helper');
const GitRepo = require('../entities/GitRepo');
const CodefreshRepo = require('../entities/CodefreshRepo');

const getRepo = async (name, context) => {
    const userOptions = {
        url: `/api/services/${encodeURIComponent(name)}`,
        method: 'get',
        qs: { context },
    };

    return sendHttpRequest(userOptions);
};

const getAllRepo = async (context) => {
    const userOptions = {
        url: '/api/repos/existing',
        method: 'get',
        qs: { context, thin: '' },
    };

    const response = await sendHttpRequest(userOptions);
    return response.map(CodefreshRepo.fromResponse);
};

const createRepository = async (name, owner, repo, context) => {
    const body = {
        serviceDetails: {
            name,
            scm: {
                name: repo,
                owner: {
                    name: owner,
                },
            },
        },
    };
    const userOptions = {
        url: '/api/services/',
        method: 'post',
        qs: { context },
        body,
    };

    return sendHttpRequest(userOptions);
};

/**
 * @throws if repo does not exist or user does not have the right permissions or if the context is not configured
 * */
const getAvailableGitRepo = async (owner, repo, context) => {
    const userOptions = {
        url: `/api/repos/${owner}/${repo}`,
        method: 'get',
        qs: { context },
    };

    return sendHttpRequest(userOptions);
};


const getAllAvailableGitRepos = async (context) => {
    const userOptions = {
        url: '/api/repos',
        method: 'get',
        qs: { context },
    };

    const response = await sendHttpRequest(userOptions);
    return response.map(GitRepo.fromResponse);
};


module.exports = {
    createRepository,
    getAvailableGitRepo,
    getRepo,
    getAllRepo,
    getAllAvailableGitRepos,
};
