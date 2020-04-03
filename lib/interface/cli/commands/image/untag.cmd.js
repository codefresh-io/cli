const Command = require('../../Command');
const _ = require('lodash');
const { sdk } = require('../../../../logic');
const Promise = require('bluebird');

const untag = new Command({
    root: true,
    command: 'untag <id> [tags..]',
    category: 'Images',
    description: 'Untag an image',
    usage: 'Unagging an image will result in the removal of tag. If registry not specified - default is used',
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
            .option('registry', {
                alias: 'r',
                description: 'Registry integration name',
            })
            .example('codefresh untag 2dfacdaad466 1.0.0', "Remove tag '1.0.0' from image '2dfacdaad466' on default registry")
            .example('codefresh untag 2dfacdaad466 1.0.0 --registry dockerhub', "Remove tag '2dfacdaad466' with a new tag: '1.0.0' on dockerhub")
            .example('codefresh untag 2dfacdaad466 1.0.0 my-tag', "Remove tags '1.0.0' and 'my-tag' from image'2dfacdaad466'");

        return yargs;
    },
    handler: async (argv) => {
        const id = argv.id;
        const tags = argv.tags;
        const registry = argv.registry;

        await Promise.each(tags, async (tag) => {
            await sdk.images.untag({ id, tag, registry });
            console.log(`Tag: ${tag} was successfully removed from image: ${id} on "${registry || 'default'}" registry'`);
        });
    },
});

module.exports = untag;
