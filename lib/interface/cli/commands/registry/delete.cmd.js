const debug = require('debug')('codefresh:cli:get:cluster');
const Command = require('../../Command');
const Output = require('../../../../output/Output');
const deleteCmd = require('../root/delete.cmd');
const yargs = require('yargs');
const { sdk } = require('../../../../logic');

const command = new Command({
    command: 'registry <ID>',
    category: 'Registries',
    parent: deleteCmd,
    description: 'Delete registry from Codefresh',
    webDocs: {
        category: 'Registries',
        title: 'Delete Registry',
    },
    builder: (y) => {
        y.positional('ID', {
            describe: 'ID of a registry to delete',
        });
        return y;
    },
    handler: async (argv) => {
        await sdk.registries.delete({ id: argv.ID });
    },
});

module.exports = command;

