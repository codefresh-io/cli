const debug = require('debug')('codefresh:cli:logs');
const Command = require('../../Command');
const _ = require('lodash');
const CFError = require('cf-errors');
const { image } = require('../../../../logic').api;


const tag = new Command({
    root: true,
    command: 'tag <id>',
    description: 'Add an image tag',
    builder: (yargs) => {
        yargs
            .option('tag', {
                describe: 'image tags',
                type: 'array',
                require: true,
            });

        return yargs;
    },
    handler: async (argv) => {
        const imageId = argv.id;
        const tags = _.isArray(argv.tag) ? argv.tag : [argv.tag];
        for (let i = 0; i < tags.length; i += 1) {
            const tag = tags[i];
            await image.addImageTag({
                imageId,
                tag,
            });
            console.log(`tag: ${tag} successfully added to image ${imageId}`);
        }
    },
});

module.exports = tag;
