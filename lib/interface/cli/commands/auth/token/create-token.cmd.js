const
    Command = require('../../../Command'),
    create = require('../../root/create.cmd'),
    createToken = require('../../../../../logic/api/token').createToken;

module.exports = new Command({
    command: 'token',
    description: 'Issues a new API token to use with Codefresh\'s CLI',
    root: true,
    parent: create,
    builder(yargs){
        return yargs.option('name', {
            description: 'A custom name to help identify the key',
            required: true,
            type: 'string',
        });
    },
    handler: ({ name: tokenName }) => createToken(tokenName)
        .then(
            (newToken) => console.log(`A new token was created "${newToken}"`),
            () => console.warn('An error has occured while creating the token'),
        ),
});
