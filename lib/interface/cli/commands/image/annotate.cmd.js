const Command = require('../../Command');
const { parseFamiliarName } = require('@codefresh-io/docker-reference');
const annotateRoot = require('../root/annotate.cmd');
const CFError = require('cf-errors');
const { sdk } = require('../../../../logic');
const annotationLogic = require('../annotation/annotation.logic');

const command = new Command({
    command: 'image <id>',
    aliases: ['img'],
    parent: annotateRoot,
    description: 'Annotate an image',
    usage: 'Annotating an image gives the ability to add extra context on your already existing images',
    webDocs: {
        category: 'Images',
        title: 'Annotate Image',
    },
    builder: (yargs) => {
        return yargs
            .positional('id', {
                describe: 'Docker image full name or id',
            })
            .option('label', {
                describe: 'annotations to add to the image',
                default: [],
                alias: 'l',
                array: true,
            })
            .example('codefresh annotate image 2dfacdaad466 -l coverage=75%', 'Annotate an image with a single label')
            .example('codefresh annotate image 2dfacdaad466 -l coverage=75% -l tests_passed=true', 'Annotate an image with multiple labels');
    },
    handler: async (argv) => {
        let dockerImageId = argv.id;
        const useFullName = dockerImageId.includes(':');

        if (useFullName) {
            const { repository, tag } = parseFamiliarName(dockerImageId);
            const results = await sdk.images.list({
                imageDisplayNameRegex: repository,
                tag,
                select: 'internalImageId',
            });

            if (!results.length) {
                throw new CFError('Image does not exist');
            }

            if (results.length > 1) {
                throw new CFError(`Could not get image id. ${results.length} images found.`);
            }

            dockerImageId = results[0].internalImageId;
        }

        await annotationLogic.createAnnotations({ entityId: dockerImageId, entityType: 'image', labels: argv.label });
        console.log('Annotations added successfully');
    },
});

module.exports = command;

