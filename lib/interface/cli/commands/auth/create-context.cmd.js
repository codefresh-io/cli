const debug = require('debug')('codefresh:auth:login');
const Command = require('../../Command');
const _ = require('lodash');
const CFError = require('cf-errors');
const DEFAULTS = require('../../defaults');
const { auth } = require('../../../../logic');
const { JWTContext, APIKeyContext } = auth.contexts;
const authManager = auth.manager;
const authRoot = require('../root/auth.cmd');

const _loginWithToken = async (url, token) => {
    let authContext;
    try {
        authContext = JWTContext.createFromToken(token, url);
        return authContext;

    } catch (err) {
        try {
            authContext = APIKeyContext.createFromToken(token, url);
            return authContext;

        } catch (err) {
            const error = new CFError({
                cause: err,
                message: 'Failed to login with api key',
            });
            throw error;
        }
    }
};

const command = new Command({
    command: 'create-context [name]',
    parent: authRoot,
    description: 'Create or update an authentication context',
    usage: 'Creating authentication contexts enables the ability to work against multiple accounts',
    webDocs: {
        category: 'Authentication',
        title: 'Create Context',
        weight: 20,
    },
    builder: (yargs) => {
        return yargs
            .option('url', {
                describe: 'Codefresh system custom url',
                default: DEFAULTS.URL,
            })
            .positional('name', {
                describe: 'Context name',
                default: 'default',
            })
            .option('api-key', {
                describe: 'API key',
                required: true,
            })
            .example('codefresh auth create-context --api-key KEY', 'Creating a default context using KEY as the api-key')
            .example('codefresh auth create-context my-context --api-key KEY', 'Creating a named context');

    },
    handler: async (argv) => {
        const authContext = await _loginWithToken(argv.url, argv['api-key']);

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
