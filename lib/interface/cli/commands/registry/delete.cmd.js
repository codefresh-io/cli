const debug = require('debug')('codefresh:cli:get:cluster');
const Command = require('../../Command');
const { registry } = require('../../../../logic').api;
const Output = require('../../../../output/Output');
const deleteCmd = require('../root/delete.cmd');
const yargs = require('yargs');

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
        await registry.remove(argv.ID);
    },
});

module.exports = command;

