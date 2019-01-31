const Command = require('../../Command');
const _ = require('lodash');
const Output = require('../../../../output/Output');
const getRoot = require('../root/get.cmd');
const Promise = require('bluebird');
const { sdk } = require('../../../../logic');
const Composition = require('../../../../logic/entities/Composition');

const command = new Command({
    command: 'compositions [id|name..]',
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
        const compositionIds = argv.id;

        let compositions = [];
        // TODO:need to decide for one way for error handeling
        if (!_.isEmpty(compositionIds)) {
            compositions = await Promise.map(compositionIds, id => sdk.compositions.get({ id }));
        } else {
            compositions = await sdk.compositions.getAll();
        }
        Output.print(compositions.map(Composition.fromResponse));
    },
});


module.exports = command;

