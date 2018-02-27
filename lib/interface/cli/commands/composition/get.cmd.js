const debug = require('debug')('codefresh:cli:create:context');
const Command = require('../../Command');
const CFError = require('cf-errors');
const _ = require('lodash');
const { composition } = require('../../../../logic').api;
const { specifyOutputForSingle, specifyOutputForArray } = require('../../helpers/get');
const getRoot = require('../root/get.cmd');


const command = new Command({
    command: 'compositions [id|name..]',
    aliases: ['com', 'composition'],
    parent: getRoot,
    description: 'Get a specific composition or an array of compositions',
    usage: 'Passing [id|name] argument will cause a retrieval of a specific composition.\n In case of not passing [id|name] argument, a list will be returned',
    webDocs: {
        category: 'Compositions',
        title: 'Get Composition',
        weight: 'get',
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
        const compositionIds = argv.id;

        let compositions = [];
        // TODO:need to decide for one way for error handeling
        if (!_.isEmpty(compositionIds)) {
            for (const id of compositionIds) {
                const currComposition = await composition.getCompositionByIdentifier(id);
                compositions.push(currComposition);
            }
        } else {
            compositions = await composition.getCompositions();
        }
        specifyOutputForArray(argv.output, compositions);
    },
});


module.exports = command;

