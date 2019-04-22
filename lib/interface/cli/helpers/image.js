const _ = require('lodash');
const filesize = require('filesize');
const Image = require('../../../logic/entities/Image');
const DEFAULTS = require('../../cli/defaults');

const NONE_TAG = '<none>';

class ImagesHelper {
    constructor() {
        this.extractFieldsForImageEntity = this.extractFieldsForImageEntity.bind(this);
        this.extractImages = this.extractImages.bind(this);
    }


    extractFieldsForImageEntity(image, tag){
        const newImage = {
            name: image.imageDisplayName,
            size: filesize(image.size),
            _id: image._id,
            annotations: _.get(image, 'metadata', {}),
            tagId: tag._id,
            created: image.created ? new Date(image.created) : undefined,
        };
        newImage.id = image.internalImageId ? image.internalImageId.substring(0, 12) : '\b';
        if (_.isEqual(tag, NONE_TAG)) {
            newImage.tag = tag;
            newImage.pull = '';
        } else {
            newImage.tag = tag.tag;
            newImage.pull = `${tag.registry}/${tag.repository}:${tag.tag}`;
        }
        return newImage;
    }


    extractImages(images, filterRegistries) {
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
                    if (filterRegistries && !_.includes(filterRegistries, tag.registry)) {
                        return;
                    }
                    if (_.includes(DEFAULTS.CODEFRESH_REGISTRIES, tag.registry)) {
                        addedCfCrTag = true;
                    }
                    const data = this.extractFieldsForImageEntity(image, tag);
                    res.push(new Image(data));
                });
                if (_.isEmpty(image.tags) || !addedCfCrTag) {
                    const data = this.extractFieldsForImageEntity(image, NONE_TAG);
                    res.push(new Image(data));
                }
                return res;
            })
            .flatten()
            .orderBy(['info.created'], ['desc'])
            .value();
    }
}

module.exports = new ImagesHelper();
