const
    Command = require('../../Command'),
    createToken = require('../../../../logic/api/token');

module.exports = new Command({
    command: 'create-token',
    description: 'Issues a new API token to use with Codefresh\'s CLI',
    root: true,
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
