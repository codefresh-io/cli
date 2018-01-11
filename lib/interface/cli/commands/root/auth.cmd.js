const Command = require('../../Command');

const auth = new Command({
    root: true,
    needAuthentication: false,
    command: 'auth',
    description: 'Manage authentication contexts',
    builder: (yargs) => {
        return yargs
            .usage('Control authentication contexts.\n' +
                '\n' +
                'The loading order follows these rules:\n' +
                '\n' +
                '  1. If the --cfconfig flag is set, then only that file is loaded. The flag may only be set once.\n' +
                'place.\n' +
                '  2. If $CFCONFIG environment variable is set, then it is used as the cfconfig file path.\n' +
                '  3. Otherwise, ${HOME}/.cfconfig is used.\n' +
                '  4. If $CF_API_KEY environment variable is set, then it will be used as the current-context ($CF_URL can be used for custom Codefresh systems).')
            .example('$0 auth login username password', '# Login using USER and PASSWORD')
            .example('$0 auth login username password --url http://custom-domain.com',
                '# Login using USER and PASSWORD to a CUSTOM on-premise codefresh instance')
            .example('$0 auth create-context name --api-key key', '# Create authentication context NAME using KEY')
            .example('$0 auth get-contexts', '# List all existing authentication contexts')
            .example('$0 auth use-context name', '# Set active authentication context using NAME context')
            .example('$0 auth current-context', '# Show active authentication context')
            .demandCommand(1, 'You need at least one command before moving on');
    },
});

module.exports = auth;
