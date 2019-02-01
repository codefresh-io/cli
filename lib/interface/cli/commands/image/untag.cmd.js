const Command = require('../../Command');
const _ = require('lodash');
const { sdk } = require('../../../../logic');
const Promise = require('bluebird');

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
        let id = argv.id;
        const tags = argv.tags;

        const result = await sdk.images.get({ id });
        id = result._id;

        await Promise.each(tags, async (tag) => {
            const foundTag = _.find(result.tags, info => info.tag === tag);
            tag = foundTag && foundTag._id;
            await sdk.images.untag({ id, tag });
            console.log(`Tag: ${tag} was successfully removed from image: ${id}`);
        });
    },
});

module.exports = untag;
