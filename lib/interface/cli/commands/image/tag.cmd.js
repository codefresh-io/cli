const debug = require('debug')('codefresh:cli:logs');
const Command = require('../../Command');
const _ = require('lodash');
const CFError = require('cf-errors');
const { image } = require('../../../../logic').api;


const tag = new Command({
    root: true,
    command: 'tag <id> [tags..]',
    category: 'Images',
    description: 'Add an image tag',
    usage: 'Tagging an image will result in the creation of a new Docker Image tag',
    webDocs: {
        category: 'Images',
        title: 'Tag image',
    },
    builder: (yargs) => {
        yargs
            .positional('id', {
                description: 'Docker image id',
            })
            .positional('names', {
                description: 'Tag names',
            })
            .example('codefresh tag 2dfacdaad466 1.0.0', "Tag image '2dfacdaad466' with a new tag: '1.0.0'")
            .example('codefresh tag 2dfacdaad466 1.0.0 my-tag', "Tag image '2dfacdaad466' with multiple tags: '1.0.0' and 'my-tag'");

        return yargs;
    },
    handler: async (argv) => {
        const imageId = argv.id;
        const tags = argv.tags;
        for (let i = 0; i < tags.length; i += 1) {
            const tag = tags[i];
            await image.addImageTag({
                imageId,
                tag,
            });
            console.log(`Tag: ${tag} was added successfully to image: ${imageId}`);
        }
    },
});

module.exports = tag;
