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
    description: 'Get a specific composition or an array of compositions',
    usage: 'Passing [id|name] argument will cause a retrieval of a specific composition.\n In case of not passing [id|name] argument, a list will be returned',
    webDocs: {
        category: 'Compositions',
        title: 'Get Composition',
    },
    builder: (yargs) => {
        return yargs
            .positional('id', {
                describe: 'composition id or name',
            })
            .example('codefresh get compositions', 'Get all compositions')
            .example('codefresh get compositions NAME', 'Get a specific composition');
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

