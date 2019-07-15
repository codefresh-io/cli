const _ = require('lodash');
const Command = require('../../Command');
const applyCmd = require('../root/apply.cmd');
const CFError = require('cf-errors');
const { sdk } = require('../../../../logic');


const command = new Command({
    command: 'tokens <id>',
    aliases: ['token'],
    parent: applyCmd,
    description: 'Revoke Codefresh token',
    usage: 'Provide one or many token ids to delete. Ids can be retrieved with "get" command',
    webDocs: {
        category: 'Tokens',
        title: 'Delete tokens',
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
            .example('codefresh delete token [token_id]', 'Delete one token')
            .example('codefresh delete tokens [token_id_1] [token_id_2]', 'Delete many tokens');
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

