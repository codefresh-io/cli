const debug = require('debug')('codefresh:cli:logs');
const Command = require('../../Command');
const _ = require('lodash');
const CFError = require('cf-errors');
const { image } = require('../../../../logic').api;


const tag = new Command({
    root: true,
    command: 'tag <id>',
    description: 'add tags for an image',
    builder: (yargs) => {
        yargs
            .option('tag', {
                describe: 'Add tags for an image',
                type: 'array',
                require: true,
            });

        return yargs;
    },
    handler: async (argv) => {
        const imageId = argv.id;
        const tags = argv.tag;

        await image.addImageTag({
            imageId,
            tags,
        });
    },
});

module.exports = tag;
