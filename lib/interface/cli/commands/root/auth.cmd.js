const Command = require('../../Command');
const DEFAULTS = require('../../defaults');

const auth = new Command({
    root: true,
    requiresAuthentication: false,
    command: 'auth',
    description: 'Manage authentication contexts',
    /* eslint-disable max-len */
    usage: `The loading order follows these rules:
    
         1. If $CF_API_KEY environment variable is set, then it will be used as the current-context ($CF_URL can be used for custom Codefresh systems). 
         2. If the --cfconfig flag is set, then only that file is loaded. The flag may only be set once.
         3. If $CFCONFIG environment variable is set, then it is used as the cfconfig file path.
         4. Otherwise, $\{HOME}/.cfconfig is used.`,
    /* eslint-enable */
    webDocs: {
        title: 'auth',
        weight: 60,
    },
    builder: (yargs) => {
        return yargs
            .option('cfconfig', {
                describe: `Custom path for authentication contexts config file (default: '${DEFAULTS.CFCONFIG}')`,
                global: true,
            })
            .demandCommand(1, 'You need at least one command before moving on');
    },
});

module.exports = auth;
