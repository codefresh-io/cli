const debug = require('debug')('codefresh:auth:login');
const Command = require('../../Command');
const _ = require('lodash');
const CFError = require('cf-errors');
const DEFAULTS = require('../../defaults');
const { auth } = require('../../../../logic');
const { JWTContext } = auth.contexts;
const authManager = auth.manager;

const _loginWithToken = async (url, token) => {
    try {
        const authContext = JWTContext.createFromToken(token, url);
        return authContext;

    } catch (err) {
        const error = new CFError({
            cause: err,
            message: 'Failed to login with token',
        });
        throw error;
    }
};

const command = new Command({
    command: 'create-context <name>',
    description: 'create-context',
    builder: (yargs) => {
        return yargs
            .usage('Create a new context from a given token')
            .option('url', {
                describe: 'Codefresh system custom url',
                default: DEFAULTS.URL,
            })
            .positional('name', {
                describe: 'Context name',
            })
            .option('token', {
                describe: 'Access token',
                required: true,
            })
            .option('type', {
                describe: 'Token type',
                choices: [JWTContext.TYPE],
                default: JWTContext.TYPE,
            });
    },
    handler: async (argv) => {
        const authContext = await _loginWithToken(argv.url, argv.token);

        await authContext.validate();

        if (argv.name) {
            authContext.setName(argv.name);
        }

        let updatedExistingContext = false;
        if (authManager.getContextByName(authContext.getName())) {
            updatedExistingContext = true;
        }

        await authManager.addContext(authContext);
        await authManager.setCurrentContext(authContext);
        await authManager.persistContexts(authContext);

        if (updatedExistingContext) {
            console.log(`Updated context: ${authContext.name}`);
        } else {
            console.log(`Created new context: ${authContext.name}`);
        }

        console.log(`Switched to context: ${authContext.name}`);
    },
});

module.exports = command;
