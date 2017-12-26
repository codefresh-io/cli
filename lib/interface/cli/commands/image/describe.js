const debug = require('debug')('codefresh:cli:create:context');
const Command = require('../../Command');
const CFError = require('cf-errors');
const _ = require('lodash');
const { image } = require('../../../../logic').api;
const yaml = require('js-yaml');

const command = new Command({
    command: 'image <id>',
    description: 'describe image',
    builder: (yargs) => {
        return yargs
            .positional('id', {
                describe: 'image id',
            });
    },
    handler: async (argv) => {
        const id = argv.filename ? _.get(argv.filename, 'id') : argv.id;
        const currImage = await image.getImageById(id);
        console.log(currImage.describe());
    },
});

module.exports = command;
