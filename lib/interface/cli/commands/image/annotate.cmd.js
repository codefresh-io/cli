const Command = require('../../Command');
const { prepareKeyValueFromCLIEnvOption } = require('../../helpers/general');
const { parseFamiliarName } = require('@codefresh-io/docker-reference');
const { image } = require('../../../../logic').api;
const annotateRoot = require('../root/annotate.cmd');

const command = new Command({
    command: 'image <id>',
    aliases: ['img'],
    category: 'Images',
    parent: annotateRoot,
    description: 'Annotate an image',
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
            .example('$0 annotate image name:tag -l coverage=75%', '# Annotate image NAME with a label')
            .example('$0 annotate image ID -l tests_passed=true', '# Annotate image ID with a label');
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

