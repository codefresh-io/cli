'use strict';

const { wrapHandler } = require('../../../helper');
const { image } = require('../../../../../logic').api;

const command = 'image <id>';

const describe = 'Add metadata annotations to image';

const builder = (yargs) => {
    return yargs
        .usage('Add metadata annotations to an image')
        .positional('id', {
            describe: 'image id or name',
        })
        .option('annotate', {
            describe: 'annotations to add to the image',
            alias: 'a',
        });
};

const handler = async (argv) => {
    const internalImageId = argv.id;
    const annotations = argv.annotate;

    await image.annotateImage(internalImageId, annotations);
    console.log('annotations add successfully');
};


module.exports = {
    command,
    describe,
    builder,
    handler: wrapHandler(handler),
};
