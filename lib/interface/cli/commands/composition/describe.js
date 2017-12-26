const debug = require('debug')('codefresh:cli:create:context');
const Command = require('../../Command');
const CFError = require('cf-errors');
const _ = require('lodash');
const { wrapHandler } = require('../../helpers/general');
const { composition } = require('../../../../logic').api;


const command = new Command({
    command: 'composition <id|name>',
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

module.exports = command;

