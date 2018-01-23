const Command = require('../../Command');
const { prepareKeyValueFromCLIEnvOption } = require('../../helpers/general');
const { parseFamiliarName } = require('@codefresh-io/docker-reference');
const { image } = require('../../../../logic').api;
const annotateRoot = require('../root/annotate.cmd');

const command = new Command({
    command: 'image <id>',
    aliases: ['img'],
    parent: annotateRoot,
    description: 'Annotate an image',
    usage: 'Annotating an image gives the ability to add extra context on your already existing images',
    webDocs: {
        category: 'Images',
        title: 'Annotate image',
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
            })
            .example('codefresh annotate image 2dfacdaad466 -l coverage=75%', 'Annotate an image with a single label')
            .example('codefresh annotate image 2dfacdaad466 -l coverage=75% -l tests_passed=true', 'Annotate an image with multiple labels');
    },
    handler: async (argv) => {
        let dockerImageId = argv.id;
        const useFullName = dockerImageId.includes(':');
        const annotations = prepareKeyValueFromCLIEnvOption(argv.label);

        if (useFullName) {
            const { repository, tag } = parseFamiliarName(dockerImageId);
            dockerImageId = await image.getDockerImageId(repository, tag);
        }

        await image.annotateImage(dockerImageId, annotations);
        console.log('annotations add successfully');
    },
});

module.exports = command;

