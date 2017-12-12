const debug           = require('debug')('codefresh:cli:create:context');
const CFError         = require('cf-errors');
const _               = require('lodash');
const { wrapHandler } = require('../../../helper');
const { image }    = require('../../../../../logic').api;
const { specifyOutputForSingle , specifyOutputForArray } = require('../helper');


const command = 'images [id]';

const builder = (yargs) => {
    return yargs
        .positional('id', {
            describe: 'image id',
        });
};

const handler = async (argv) => {
    const imageId  = argv.id;

    let images;
    // TODO:need to decide for one way for error handeling
    if (imageId) {
        images = await image.getImageById(imageId);
        specifyOutputForSingle(argv.output, images);
    } else {
        images = await image.getImages();
        specifyOutputForArray(argv.output, images);
    }
};

module.exports = {
    command,
    builder,
    handler: wrapHandler(handler),
};
