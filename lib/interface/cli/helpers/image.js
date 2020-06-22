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
            name: image.imageDisplayName || image.imageName,
            size: image.size && filesize(image.size),
            sha: image.sha,
            annotations: _.get(image, 'metadata', {}),
            tagId: tag._id,
            created: image.created ? new Date(image.created) : undefined,
            hash: image.hash || image._id,
        };
        newImage.id = image.internalImageId ? image.internalImageId.substring(0, 12) : '\b';
        if (_.isEqual(tag, NONE_TAG)) {
            newImage.tag = tag;
            newImage.pull = image.repoDigest || '';
        } else {
            newImage.tag = tag.tag;
            newImage.pull = `${tag.registry}/${tag.repository}:${tag.tag}`;
        }
        return newImage;
    }


    extractImages(images) {
        if (!_.isArray(images)) {
            images = [images]; // eslint-disable-line no-param-reassign
        }
        return _.chain(images)
            .map((image) => {
                const res = [];
                let volumeImage = false;
                _.forEach(image.tags, (tag) => {
                    if (_.isEqual(tag.tag, 'volume')) {
                        volumeImage = true;
                        return;
                    }

                    const data = this.extractFieldsForImageEntity(image, tag);
                    res.push(new Image(data));
                });
                if (_.isEmpty(image.tags) && !volumeImage) {
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
