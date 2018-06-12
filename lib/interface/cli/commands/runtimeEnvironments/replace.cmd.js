const debug = require('debug')('codefresh:cli:replace:context');
const Command = require('../../Command');
const CFError = require('cf-errors');
const _ = require('lodash');
const { runtimeEnvironments } = require('../../../../logic').api;
const replaceRoot = require('../root/replace.cmd');


const command = new Command({
    command: 'runtime-environments name',
    aliases: ['re','runtime-environment'],
    parent: replaceRoot,
    description: 'Replace a runtime-environments resource',
    webDocs: {
        category: 'Runtime-Environments',
        title: 'Replace Runtime-Environments',
    },
    builder: (yargs) => {
        return yargs
            .positional('name', {
                describe: 'Runtime environments name',
                default: 'default',
            });
    },
    handler: async (argv) => {
        const data = argv.filename;
        const name = argv.name;

        await runtimeEnvironments.replaceByName(name, data);

        console.log(`Runtime-Environments: ${name} replaced`);
    },
});


module.exports = command;

