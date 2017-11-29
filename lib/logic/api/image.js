const _                   = require('lodash');
const CFError             = require('cf-errors');
const { sendHttpRequest } = require('./helper');

const getDockerImageId = async (imageDisplayName, tag) => {
    const options = {
        url: '/api/images',
        qs: {
            imageDisplayName,
            tag,
            select: 'internalImageId',
        },
    };

    const results = await sendHttpRequest(options);

    if (!results.length) {
        throw new CFError('Image does not exist');
    }

    if (results.length > 1) {
        throw new CFError(`Could not get image id. ${results.length} images found.`);
    }

    return results[0].internalImageId;
};

const annotateImage = async (dockerImageId, annotations) => {
    const options = {
        url: `/api/images/${encodeURIComponent(dockerImageId)}/metadata`,
        method: 'POST',
        body: annotations,
    };

    return await sendHttpRequest(options);
};

module.exports = {
    annotateImage,
    getDockerImageId,
};