const debug = require('debug')('codefresh:cli:logs');
const Command = require('../../Command');
const _ = require('lodash');
const CFError = require('cf-errors');
const { image } = require('../../../../logic').api;
const { sdk } = require('../../../../logic');


const untag = new Command({
    root: true,
    command: 'untag <id> [tags..]',
    category: 'Images',
    description: 'Untag an image',
    webDocs: {
        category: 'Images',
        title: 'Untag Image',
        weight: 70,
    },
    builder: (yargs) => {
        yargs
            .positional('id', {
                description: 'Docker image id',
            })
            .positional('names', {
                description: 'Tag names',
            })
            .example('codefresh untag 2dfacdaad466 1.0.0', "Remove tag '1.0.0' from image '2dfacdaad466'")
            .example('codefresh untag 2dfacdaad466 1.0.0 my-tag', "Remove tags '1.0.0' and 'my-tag' from image'2dfacdaad466'");

        return yargs;
    },
    handler: async (argv) => {
        const imageId = argv.id;
        const tags = argv.tags;

        await Promise.map(tags, (tag) => {
            // todo : find
            return sdk.images.untag({ imageId, tag })
                .then(() => console.log(`Tag: ${tag} was successfully removed from image: ${imageId}`));
        });
    },
});

module.exports = untag;
