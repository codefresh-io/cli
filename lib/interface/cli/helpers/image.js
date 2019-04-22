const _ = require('lodash');
const filesize = require('filesize');
const Image = require('../../../logic/entities/Image');
const DEFAULTS = require('../../cli/defaults');


const extractFieldsForImageEntity = (image, tag) => {
    const newImage = {
        name: image.imageDisplayName,
        size: filesize(image.size),
        _id: image._id,
        annotations: _.get(image, 'metadata', {}),
        tagId: tag._id,
        created: image.created ? new Date(image.created) : undefined,
    };
    newImage.id = image.internalImageId ? image.internalImageId.substring(0, 12) : '\b';
    if (_.isEqual(tag, '<none>')) {
        newImage.tag = tag;
        newImage.pull = '';
    } else {
        newImage.tag = tag.tag;
        newImage.pull = `${tag.registry}/${tag.repository}:${tag.tag}`;
    }
    return newImage;
};


const extractImages = (images, filterRegistries) => {
    if (!_.isArray(images)) {
        images = [images]; // eslint-disable-line no-param-reassign
    }
    return _.chain(images)
        .map((image) => {
            const res = [];
            let addedCfCrTag = false;
            _.forEach(image.tags, (tag) => {
                if (_.isEqual(tag.tag, 'volume')) {
                    addedCfCrTag = true;
                    return;
                }
                // in case we are filtering by registries, ignore the image if it is not from the registires list
                if (filterRegistries && filterRegistries.indexOf(tag.registry) === -1) {
                    return;
                }
                if (DEFAULTS.CODEFRESH_REGISTRIES.indexOf(tag.registry) !== -1) {
                    addedCfCrTag = true;
                }
                const data = extractFieldsForImageEntity(image, tag);
                res.push(new Image(data));
            });
            if (_.isEmpty(image.tags) || !addedCfCrTag) {
                const data = extractFieldsForImageEntity(image, '<none>');
                res.push(new Image(data));
            }
            return res;
        })
        .flatten()
        .forEach(i => console.log(i))
        .orderBy(['info.created'], ['desc'])
        .value();
};

module.exports = {
    extractImages,
};
