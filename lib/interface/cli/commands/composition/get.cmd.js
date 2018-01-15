const debug = require('debug')('codefresh:cli:create:context');
const Command = require('../../Command');
const CFError = require('cf-errors');
const _ = require('lodash');
const { composition } = require('../../../../logic').api;
const { specifyOutputForSingle, specifyOutputForArray } = require('../../helpers/get');
const getRoot = require('../root/get.cmd');


const command = new Command({
    command: 'compositions [id|name]',
    aliases: ['com', 'composition'],
    parent: getRoot,
    cliDocs: {
        description: 'Get a specific composition or an array of compositions',
    },
    webDocs: {
        category: 'Compositions',
        title: 'Get a single composition',
    },
    builder: (yargs) => {
        return yargs
            .positional('id', {
                describe: 'composition id or name',
            });
    },
    handler: async (argv) => {
        const compositionId = argv.id;

        let compositions;
        // TODO:need to decide for one way for error handeling
        if (compositionId) {
            compositions = await composition.getCompositionByIdentifier(compositionId);
            specifyOutputForSingle(argv.output, compositions);
        } else {
            compositions = await composition.getCompositions();
            specifyOutputForArray(argv.output, compositions);
        }
    },
});


module.exports = command;

