const _ = require('lodash');
const CFError = require('cf-errors');
const { sendHttpRequest } = require('./helper');
const filesize = require('filesize');
const moment = require('moment');
const Image = require('../entities/Image');
const DEFAULTS = require('../../interface/cli/defaults');


const _extractFieldsForImageEntity = (image, tag) => {
    const newImage = {
        name: image.imageDisplayName,
        size: filesize(image.size),
        _id: image._id,
    };
    newImage.image_id = image.internalImageId ? image.internalImageId.substring(0, 12) : '';
    if (_.isEqual(tag, '<none>')) {
        newImage.tag = tag;
        newImage.pull = '';
        newImage.created = moment(image.created)
            .fromNow();
    } else {
        newImage.tag = tag.tag;
        newImage.pull = `${tag.registry}/${tag.repository}:${tag.tag}`;
        newImage.created = moment(tag.created)
            .fromNow();
    }
    return newImage;
};


const getAll = async (options) => {
    const qs = {
        limit: options.limit,
        offset: options.offset,
        metadata: options.labels,
        type: options.type,
        branch: options.branch,
        imageDisplayNameRegex: options.imageName,
        select: 'internalName tags internalImageId created size imageDisplayName',
    };

    if (options.sha) {
        qs.sha = options.sha;
    }

    const RequestOptions = {
        url: '/api/images',
        qs,
    };

    const images = await sendHttpRequest(RequestOptions);
    if (_.isEmpty(images)) {
        throw new CFError('Error from server (NotFound): Images not found');
    }
    const res = [];
    _.forEach(images.docs, (image) => {
        let addedCfCrTag = false;
        _.forEach(image.tags, (tag) => {
            // in case we are filtering by registries, ignore the image if it is not from the registires list
            if (options.filterRegistries && options.filterRegistries.indexOf(tag.registry) === -1) {
                return;
            }
            if (_.isEqual(tag.tag, 'volume')) {
                addedCfCrTag = true;
                return;
            }
            if (DEFAULTS.CODEFRESH_REGISTRIES.indexOf(tag.registry) !== -1) {
                addedCfCrTag = true;
            }
            const data = _extractFieldsForImageEntity(image, tag);
            res.push(new Image(data));
        });
        if (_.isEmpty(image.tags) || !addedCfCrTag) {
            const data = _extractFieldsForImageEntity(image, '<none>');
            res.push(new Image(data));
        }
    });
    return res;
};

const getImageById = async (imageId) => {
    const options = {
        url: `/api/images/${encodeURIComponent(imageId)}`,
        method: 'GET',
    };
    const image = await sendHttpRequest(options);
    if (_.isEmpty(image)) {
        throw new CFError(`Error from server (NotFound): Image ${imageId} not found`);
    }
    const res = [];
    let data = {};
    _.forEach(image.tags, (tag) => {
        data = _extractFieldsForImageEntity(image, tag);
        res.push(new Image(data));
    });

    return res;
};

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

    return sendHttpRequest(options);
};

const addImageTag = async (options) => {
    const images = await getImageById(options.imageId);
    const imageId = images[0].info._id;
    const tags = _.isArray(options.tags) ? options.tags : [options.tags];
    _.forEach(tags, (tag) => {
        const RequestOptions = {
            url: `/api/images/${encodeURIComponent(imageId)}/tag/${tag}`,
            method: 'POST',
        };
        sendHttpRequest(RequestOptions);
        console.log(`tag: ${(tag)} successfully added to image ${imageId}`);
    });
};

module.exports = {
    annotateImage,
    getDockerImageId,
    getAll,
    getImageById,
    addImageTag,
};
