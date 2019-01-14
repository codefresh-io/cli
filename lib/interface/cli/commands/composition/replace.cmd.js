const debug = require('debug')('codefresh:cli:replace:context');
const Command = require('../../Command');
const CFError = require('cf-errors');
const _ = require('lodash');
const { composition } = require('../../../../logic').api;
const replaceRoot = require('../root/replace.cmd');
const { crudFilenameOption } = require('../../helpers/general');


const command = new Command({
    command: 'composition',
    aliases: ['com'],
    parent: replaceRoot,
    description: 'Replace a composition resource',
    webDocs: {
        category: 'Compositions',
        title: 'Replace Composition',
    },
    builder: (yargs) => {
        crudFilenameOption(yargs);
        return yargs;
    },
    handler: async (argv) => {
        const data = argv.filename;
        const name = _.get(data, 'name');
        let id;

        if (!name) {
            throw new CFError('Missing name of the composition');
        }

        const currComposition = await composition.getCompositionByIdentifier(name);
        if (currComposition) {
            id = currComposition.info.id;
        }
        if (!id) {
            throw new CFError(`Cannot found composition: ${name}`);
        }

        await composition.replaceById(id, data);

        console.log(`Composition: ${name} replaced`);
    },
});


module.exports = command;

