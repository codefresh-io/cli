const _ = require('lodash');
const Command = require('../../Command');
const deleteCmd = require('../root/delete.cmd');
const { token } = require('../../../../logic').api;


const command = new Command({
    command: 'tokens [ids..]',
    aliases: ['token'],
    parent: deleteCmd,
    description: 'Revoke Codefresh token',
    usage: 'Provide one or many token ids to delete. Ids can be retrieved with "get" command',
    webDocs: {
        category: 'Tokens',
        title: 'Delete tokens',
        weight: 40,
    },
    builder: (yargs) => {
        yargs
            .positional('ids', {
                describe: 'token names or ids',
                required: true,
            })
            .example('codefresh delete token [token_id]', 'Delete one token')
            .example('codefresh delete tokens [token_id_1] [token_id_2]', 'Delete many tokens');
    },
    handler: async (argv) => {
        if (_.isEmpty(argv.ids)) {
            console.log('Token ids must be provided');
            return;
        }

        const promises = argv.ids.map((id) => {
            return token.deleteToken(id)
                .then(() => console.log(`Deleted token: '${id}'`))
                .catch(err => console.log(`Not deleted: '${id}' -- ${err}`));
        });
        await Promise.all(promises);
    },
});

module.exports = command;

