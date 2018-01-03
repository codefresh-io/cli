const debug = require('debug')('codefresh:cli:create:context');
const Command = require('../../Command');
const CFError = require('cf-errors');
const _ = require('lodash');
const { image } = require('../../../../logic').api;
const yaml = require('js-yaml');
const describeRoot = require('../root/describe.cmd');

const command = new Command({
    command: 'image <id>',
    aliases: ['img'],
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
describeRoot.subCommand(command);


module.exports = command;
