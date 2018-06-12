const debug = require('debug')('codefresh:cli:replace:context');
const Command = require('../../Command');
const CFError = require('cf-errors');
const _ = require('lodash');
const { runtimeEnvironments } = require('../../../../logic/index').api;
const replaceRoot = require('../root/replace.cmd');


const command = new Command({
    command: 'runtime-environments name',
    aliases: ['re','runtime-environment'],
    parent: replaceRoot,
    onPremCommand: true,
    description: 'Replace a runtime-environments resource',
    webDocs: {
        category: 'Runtime-Environments (On Prem)',
        title: 'Replace Runtime-Environments',
    },
    builder: (yargs) => {
        return yargs
            .positional('name', {
                default: 'default',
                describe: 'Runtime environments name',
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

