const _                   = require('lodash');
const CFError             = require('cf-errors');
const { sendHttpRequest } = require('./helper');
const Image               = require('../entities/Image');

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

const getImages = async () => {
    const options = {
        url: '/api/images',
        method: 'GET',
    };

    const result = await sendHttpRequest(options);
    const images = [];

    _.forEach(result, (image) => {
        images.push(new Image(image));
    });

    return images;
};

const getImageById = async (imageId) => {
    const options = {
        url: `/api/images/${encodeURIComponent(imageId)}`,
        method: 'GET',
    };

    const result = await sendHttpRequest(options);
    const currImage = new Image(result);

    return currImage;
};


module.exports = {
    annotateImage,
    getDockerImageId,
    getImages,
    getImageById,
};