const debug = require('debug')('codefresh:cli:create:context');
const Command = require('../../Command');
const CFError = require('cf-errors');
const _ = require('lodash');
const { context } = require('../../../../logic').api;
const applyRoot = require('../root/apply.cmd');


const command = new Command({
    command: 'context',
    description: 'Apply changes to a context',
    builder: (yargs) => {
        return yargs;
    },
    handler: async (argv) => {
        const data = argv.filename;
        const name = _.get(data, 'metadata.name');

        if (!name) {
            throw new CFError('Missing name in metadata');
        }

        try {
            await context.getContextByName(name);

            await context.applyByName(name, data);
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
applyRoot.subCommand(command);


module.exports = command;

