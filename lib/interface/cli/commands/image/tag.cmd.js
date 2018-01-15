const debug = require('debug')('codefresh:cli:logs');
const Command = require('../../Command');
const _ = require('lodash');
const CFError = require('cf-errors');
const { image } = require('../../../../logic').api;


const tag = new Command({
    root: true,
    command: 'tag <id> [tags..]',
    category: 'Images',
    cliDocs: {
        description: 'Add an image tag',
    },
    webDocs: {
        category: 'Images',
        title: 'Tag an image',
    },
    builder: (yargs) => {
        yargs
            .positional('id', {
                description: 'Docker image id',
            })
            .positional('names', {
                description: 'Tag names',
            });

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
