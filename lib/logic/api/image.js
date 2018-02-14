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
        annotations: _.get(image, 'metadata', {}),
        tagId: tag._id,
    };
    newImage.image_id = image.internalImageId ? image.internalImageId.substring(0, 12) : '\b';
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


const _extractImages = (image, options) => {
    const res = [];
    let addedCfCrTag = false;
    _.forEach(image.tags, (tag) => {
        if (_.isEqual(tag.tag, 'volume')) {
            addedCfCrTag = true;
            return;
        }
        // in case we are filtering by registries, ignore the image if it is not from the registires list
        if (options.filterRegistries && options.filterRegistries.indexOf(tag.registry) === -1) {
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
    return res;
};


const getAll = async (options) => {
    const qs = {
        limit: options.limit,
        offset: options.offset,
        metadata: options.labels,
        tag: options.tags,
        type: options.type,
        branch: options.branch,
        imageDisplayNameRegex: options.imageName,
        select: 'internalName tags internalImageId created size imageDisplayName metadata',
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
    let res = [];
    _.forEach(images.docs, (image) => {
        res = res.concat(_extractImages(image, options));
    });
    return res;
};

const getImageById = async (options) => {
    const id = options.imageId;
    const RequestOptions = {
        url: `/api/images/${encodeURIComponent(id)}`,
        method: 'GET',
    };
    const image = await sendHttpRequest(RequestOptions);
    if (!_.isEmpty(image)) {
        const res = _extractImages(image, options);
        if (!_.isEmpty(res)) {
            return res;
        }
    }
    throw new CFError(`Error from server (NotFound): Image ${id} not found`);
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
    const image = await getImageById({ imageId: options.imageId });
    const imageId = image[0].info._id;
    const RequestOptions = {
        url: `/api/images/${encodeURIComponent(imageId)}/tag/${options.tag}`,
        method: 'POST',
    };
    return sendHttpRequest(RequestOptions);
};

const untagImage = async (options) => {
    const tag = options.tag;
    const images = await getImageById({ imageId: options.imageId });
    const imageId = images[0].info._id;
    const image = _.find(images, (image) => {
        return _.isEqual(image.info.tag, tag);
    });
    if (image) {
        const RequestOptions = {
            url: `/api/images/${encodeURIComponent(imageId)}/tag/${image.info.tagId}`,
            method: 'DELETE',
        };
        return sendHttpRequest(RequestOptions);
    }
    throw new CFError(`Error from server (NotFound): Tag ${tag} not found`);
};

module.exports = {
    annotateImage,
    getDockerImageId,
    getAll,
    getImageById,
    addImageTag,
    untagImage,
};
