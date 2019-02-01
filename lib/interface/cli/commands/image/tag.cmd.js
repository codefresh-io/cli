const Command = require('../../Command');
const { sdk } = require('../../../../logic');
const Promise = require('bluebird');


const tag = new Command({
    root: true,
    command: 'tag <id> [tags..]',
    category: 'Images',
    description: 'Add an image tag',
    usage: 'Tagging an image will result in the creation of a new Docker Image tag',
    webDocs: {
        category: 'Images',
        title: 'Tag Image',
        weight: 60,
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
        let id = argv.id;
        const tags = argv.tags;

        const result = await sdk.images.get({ id });
        id = result._id;

        await Promise.each(tags, async (tag) => {
            await sdk.images.tag({ id, tag });
            console.log(`Tag: ${tag} was added successfully to image: ${id}`);
        });
    },
});

module.exports = tag;
