'use strict';

const { wrapHandler, prepareKeyValueFromCLIEnvOption } = require('../../../helper');
const { parseFamiliarName } = require('@codefresh-io/docker-reference');
const { image } = require('../../../../../logic').api;

const command = 'image <id> [--use-full-name]';

const describe = 'Add metadata annotations to image';

const builder = (yargs) => {
    return yargs
        .usage('Add metadata annotations to an image')
        .positional('id', {
            describe: 'docker image id or image name',
        })
        .option('use-full-name', {
            describe: 'use image name instead of docker image id',
            default: false
        })
        .option('label', {
            describe: 'annotations to add to the image',
            default: [],
            alias: 'l',
        });
};

const handler = async (argv) => {
    const useFullName = argv['use-full-name'];
    let internalImageId = argv.id;
    const annotations = prepareKeyValueFromCLIEnvOption(argv.label);

    if (useFullName) {
        const { repository, tag } = parseFamiliarName(internalImageId);
        internalImageId = await image.getDockerImageId(repository, tag);
    }

    await image.annotateImage(internalImageId, annotations);
    console.log('annotations add successfully');
};

module.exports = {
    command,
    describe,
    builder,
    handler: wrapHandler(handler),
};
