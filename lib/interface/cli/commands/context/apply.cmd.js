const Command = require('../../Command');
const CFError = require('cf-errors');
const _ = require('lodash');
const applyRoot = require('../root/apply.cmd');
const { crudFilenameOption } = require('../../helpers/general');
const { sdk } = require('../../../../logic');


const command = new Command({
    command: 'context',
    aliases: ['ctx'],
    parent: applyRoot,
    description: 'Apply changes to a context',
    usage: 'Use apply to patch an existing context',
    webDocs: {
        category: 'Contexts',
        title: 'Update Context',
        weight: 90,
    },
    builder: (yargs) => {
        crudFilenameOption(yargs);
        return yargs
            .example('codefresh patch context -f ./context.yml', 'Apply changes to a context');
    },
    handler: async (argv) => {
        const data = argv.filename;
        const name = _.get(data, 'metadata.name');

        if (!name) {
            throw new CFError('Missing name in metadata');
        }

        try {
            await sdk.contexts.get({ name });

            await sdk.contexts.patch({ name }, data);
            console.log(`Context: ${name} patched`);
        } catch (err) {
            if (err) {
                await sdk.contexts.create(data);
                console.log(`Context: ${name} created`);
            } else {
                throw err;
            }
        }
    },
});


module.exports = command;

