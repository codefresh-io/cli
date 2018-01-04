const debug = require('debug')('codefresh:cli:create:context');
const Command = require('../../Command');
const CFError = require('cf-errors');
const _ = require('lodash');
const { composition } = require('../../../../logic').api;
const describeRoot = require('../root/describe.cmd');


const command = new Command({
    command: 'composition <id|name>',
    aliases: ['com'],
    description: 'Describe a composition',
    builder: (yargs) => {
        return yargs
            .positional('id', {
                describe: 'composition id or name',
            });
    },
    handler: async (argv) => {
        const id = argv.filename ? _.get(argv.filename, 'name') : argv.id;

        const currComposition = await composition.getCompositionByIdentifier(id);
        console.log(currComposition.describe());
    },
});
describeRoot.subCommand(command);


module.exports = command;

