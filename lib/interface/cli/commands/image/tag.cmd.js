const Command = require('../../Command');
const { sdk } = require('../../../../logic');
const Promise = require('bluebird');


const tag = new Command({
    root: true,
    command: 'tag <id> [tags..]',
    category: 'Images',
    description: 'Add an image tag',
    usage: 'Tagging an image will result in the creation of a new Docker Image tag. If registry not specified - default is used',
    webDocs: {
        category: 'Images',
        title: 'Tag Image',
        weight: 60,
    },
    builder: (yargs) => {
        yargs
            .parserConfiguration({
                'parse-numbers': false,
            })
            .positional('id', {
                description: 'Docker image id',
            })
            .positional('names', {
                description: 'Tag names',
            })
            .option('registry', {
                alias: 'r',
                description: 'Registry integration name',
            })
            .example('codefresh tag 2dfacdaad466 1.0.0', "Tag image '2dfacdaad466' with a new tag: '1.0.0' on default registry")
            .example('codefresh tag 2dfacdaad466 1.0.0 --registry dockerhub', "Tag image '2dfacdaad466' with a new tag: '1.0.0' on dockerhub")
            .example('codefresh tag 2dfacdaad466 1.0.0 my-tag', "Tag image '2dfacdaad466' with multiple tags: '1.0.0' and 'my-tag'");

        return yargs;
    },
    handler: async (argv) => {
        const id = argv.id;
        const tags = argv.tags;
        const registry = argv.registry;

        await Promise.each(tags, async (tag) => {
            await sdk.images.tag({ id, tag, registry });
            console.log(`Tag: ${tag} was added successfully to image: ${id} on "${registry || 'default'}" registry`);
        });
    },
});

module.exports = tag;
