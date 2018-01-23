const Command = require('../../Command');

const auth = new Command({
    root: true,
    requiresAuthentication: false,
    command: 'auth',
    description: 'Manage authentication contexts',
    usage: 'The loading order follows these rules:\n' +
    '\n' +
    '  1. If the --cfconfig flag is set, then only that file is loaded. The flag may only be set once.\n' +
    'place.\n' +
    '  2. If $CFCONFIG environment variable is set, then it is used as the cfconfig file path.\n' +
    '  3. Otherwise, ${HOME}/.cfconfig is used.\n' +
    '  4. If $CF_API_KEY environment variable is set, then it will be used as the current-context ($CF_URL can be used for custom Codefresh systems).',
    builder: (yargs) => {
        return yargs
            .demandCommand(1, 'You need at least one command before moving on');
    },
});

module.exports = auth;
