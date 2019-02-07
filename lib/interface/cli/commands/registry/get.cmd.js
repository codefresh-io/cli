const debug = require('debug')('codefresh:cli:get:cluster');
const Command = require('../../Command');
const { registry } = require('../../../../logic').api;
const Output = require('../../../../output/Output');
const getRoot = require('../root/get.cmd');


const command = new Command({
    command: 'registry',
    category: 'Registries',
    parent: getRoot,
    description: 'Get an array of accounts registries',
    webDocs: {
        category: 'Registries',
        title: 'Get Registries',
    },
    builder: (yargs) => {
        return yargs
            .example('codefresh get registry', 'Get all registries connected to the account');
    },
    handler: async (argv) => {
        const registries = await registry.list();
        Output.print(registries);
    },
});

module.exports = command;

