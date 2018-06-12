const debug = require('debug')('codefresh:cli:create:context');
const Command = require('../../Command');
const CFError = require('cf-errors');
const _ = require('lodash');
const { runtimeEnvironments } = require('../../../../logic').api;
const applyRoot = require('../root/apply.cmd');


const command = new Command({
    command: 'runtime-environments',
    aliases: ['re','runtime-environment'],
    parent: applyRoot,
    description: 'Apply changes to a runtime-environments',
    usage: 'Use apply to patch an existing runtime-environments',
    webDocs: {
        category: 'Runtime-Environments',
        title: 'Update Runtime-Environments',
        weight: 90,
    },
    builder: (yargs) => {
        return yargs
            .example('codefresh apply Runtime-Environments -f ./runtime-environments.yml', 'Apply changes to a runtime-environments');
    },
    handler: async (argv) => {
        const data = argv.filename;
        const name = _.get(data, 'metadata.name');

        if (!name) {
            throw new CFError('Missing name in metadata');
        }

        try {
            await runtimeEnvironments.applyByName(name, data);
            console.log(`Context: ${name} patched`);
        } catch (err) {
            if (err) {
                await context.createContext(data);
                console.log(`Context: ${name} created`);
            } else {
                throw err;
            }
        }
    },
});


module.exports = command;

