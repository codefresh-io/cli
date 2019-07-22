const _ = require('lodash');
const Command = require('../../Command');
const applyCmd = require('../root/apply.cmd');
const CFError = require('cf-errors');
const { sdk } = require('../../../../logic');


const command = new Command({
    command: 'tokens <id>',
    aliases: ['token'],
    parent: applyCmd,
    description: 'Patch Codefresh token',
    usage: 'Update token name or scopes using token id. Id can be retrieved using "get" command',
    webDocs: {
        category: 'Tokens',
        title: 'Patch token',
        weight: 40,
    },
    builder: (yargs) => {
        yargs
            .positional('id', {
                describe: 'token id',
                required: true,
            })
            .option('name', {
                describe: 'token name or ids',
            })
            .option('scope', {
                alias: 's',
                describe: 'token names or ids',
                array: true,
            })
            .example('codefresh patch token [token_id] --name new-name', 'Update token name')
            .example(
                'codefresh patch token [token_id] -s pipeline -s project',
                'Set token scopes to ["pipeline", "project"] (will replace old scopes with new)',
            );
    },
    handler: async (argv) => {
        if (argv.scope && _.isEmpty(argv.scope)) {
            throw new CFError('Token must have at least one scope');
        }
        const { id, name, scope } = argv;
        await sdk.tokens.patch({ id }, { name, scopes: scope });
        console.log(`Token ${id} updated`);
    },
});

module.exports = command;

