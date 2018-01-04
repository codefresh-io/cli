const debug = require('debug')('codefresh:cli:create:context');
const Command = require('../../Command');
const CFError = require('cf-errors');
const _ = require('lodash');
const { composition } = require('../../../../logic').api;
const deleteRoot = require('../root/delete.cmd');


const command = new Command({
    command: 'composition [name]',
    aliases: ['com'],
    description: 'Delete a composition',
    builder: (yargs) => {
        return yargs
            .positional('name', {
                describe: 'Composition name',
            });
    },
    handler: async (argv) => {
        const name = (argv.filename) ? _.get(argv.filename, 'name') : argv.name;
        const currComposition = await composition.getCompositionByIdentifier(name);
        const id = currComposition ? currComposition.info.id : null;
        if (!id) {
            throw new CFError(`Cannot found composition: ${name}`);
        }
        await composition.deleteCompositionById(id);
        console.log(`Composition: ${name} deleted`);
    },
});
deleteRoot.subCommand(command);


module.exports = command;

