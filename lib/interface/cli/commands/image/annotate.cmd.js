const Command = require('../../Command');
const annotateRoot = require('../root/annotate.cmd');
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
            .example('codefresh annotate image 2dfacdaad466 -l coverage=75% -l tests_passed=true', 'Annotate an image with multiple labels')
            .example('codefresh annotate image codefresh/cli:latest -l coverage=75% -l tests_passed=true', 'Annotate an image by name with multiple labels');
    },
    handler: async (argv) => {
        await annotationLogic.createAnnotations({ entityId: argv.id, entityType: 'image', labels: argv.label });
        console.log('Annotations added successfully');
    },
});

module.exports = command;

