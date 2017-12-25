const debug = require('debug')('codefresh:cli:create:context');
const CFError = require('cf-errors');
const _ = require('lodash');
const DEFAULTS = require('../../defaults');
const { wrapHandler, prepareKeyValueFromCLIEnvOption } = require('../../helpers/general');
const { image } = require('../../../../logic').api;
const columnify = require('columnify');
const { specifyOutputForArray } = require('../../helpers/get');


const command = 'images [id]';

const builder = (yargs) => {
    return yargs
        .positional('id', {
            describe: 'image id',
        })
        .option('limit', {
            describe: 'Limit amount of returned results',
            default: DEFAULTS.GET_LIMIT_RESULTS,
        })
        .option('all-registries', {
            describe: 'Return images from all possible registries (by default only r.cfcr.io images will be returned)',
            default: false,
        })
        .option('label', {
            describe: 'Filter by a list of annotated labels',
            alias: 'l',
            default: [],
        })
        .option('sha', {
            describe: 'Filter by specific commit sha',
            alias: 's',
        });
};

const handler = async (argv) => {
    const imageId = argv.id;
    const labels = prepareKeyValueFromCLIEnvOption(argv.label);
    const sha = argv.sha;
    const limit = argv.limit;
    const volumeImages = argv['volume-images'];
    const allRegistries = argv['all-registries'];
    let filterRegistries;
    if (!allRegistries) {
        filterRegistries = DEFAULTS.CODEFRESH_REGISTRIES;
    }

    let images;
    // TODO:need to decide for one way for error handeling
    if (imageId) {
        images = await image.getImageById(imageId);
    } else {
        images = await image.getAll({
            labels,
            sha,
            limit,
            volumeImages,
            filterRegistries,
        });
    }

    specifyOutputForArray(argv.output, images);
};

module.exports = {
    command,
    builder,
    handler: wrapHandler(handler),
};
