'use strict';

const debug    = require('debug')('codefresh:cli:login:index');
const commands = require('./commands');

const command = 'auth';

const describe = 'Authentication';

const builder = (yargs) => {
    return yargs
        .usage('Control authentication contexts.\n' +
               '\n' +
               'The loading order follows these rules:\n' +
               '\n' +
               '  1. If the --cfconfig flag is set, then only that file is loaded. The flag may only be set once.\n' +
               'place.\n' +
               '  2. If $CFCONFIG environment variable is set, then it is used as the cfconfig file path.\n' +
               '  3. Otherwise, ${HOME}/.cfconfig is used.')
        .command(commands.login)
        .command(commands.getContexts)
        .command(commands.currentContext)
        .command(commands.useContext)
        .command(commands.createContext)
        .demandCommand(1, 'You need at least one command before moving on');
};

module.exports = {
    command,
    describe,
    builder,
};
