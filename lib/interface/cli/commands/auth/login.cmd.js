const debug = require('debug')('codefresh:auth:login');
const Command = require('../../Command');
const _ = require('lodash');
const CFError = require('cf-errors');
const DEFAULTS = require('../../defaults');
const { auth } = require('../../../../logic');
const { JWTContext } = auth.contexts;
const authManager = auth.manager;
const authRoot = require('../root/auth.cmd');

const _loginWithUserPassword = async (username, password) => {
    try {
        // TODO implement logic to get token by calling the pai
    } catch (err) {
        throw new CFError({
            cause: err,
            message: 'Failed to login with username and password',
        });
    }
};

const command = new Command({
    command: 'login <username> <password>',
    description: 'Login',
    builder: (yargs) => {
        return yargs
            .usage('Login options')
            .positional('username', {
                describe: 'username',
                required: true,
            })
            .positional('password', {
                describe: 'password',
                required: true,
            })
            .option('url', {
                describe: 'Codefresh system custom url',
                default: DEFAULTS.URL,
            });
    },
    handler: async (argv) => {
        const authContext = await _loginWithUserPassword(argv.username, argv.password);

        await authContext.validate();
        await authManager.addContext(authContext);
        await authManager.setCurrentContext(authContext);
        await authManager.persistContexts(authContext);

        console.log(`Login succeeded to ${authContext.url}`);
        console.log(`Switched to context: ${authContext.name}`);
    },
});
authRoot.subCommand(command);


module.exports = command;
