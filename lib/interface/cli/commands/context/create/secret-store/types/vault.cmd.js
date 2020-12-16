const Command = require('../../../../../Command');
const CFError = require('cf-errors');
const cmd = require('../base.cmd');
const { sdk } = require('../../../../../../../logic');

function buildAuthObject({ authType, token, username, password, roleId, secretId }) {
    switch (authType) {
        case 'token':
            if (!token) {
                throw new CFError('--authType token must include --token argument');
            }

            return { type: authType, token };
        case 'userpass':
            if (!username || !password) {
                throw new CFError('--authType userpass must include --username and --password arguments');
            }

            return { type: authType, username, password };
        case 'approle':
            if (!roleId || !secretId) {
                throw new CFError('--authType approle must include --roleId and --secretId arguments');
            }

            return { type: authType, roleId, secretId };
        default:
            throw new CFError(`Unknown authType: ${authType}`);
    }
}

const command = new Command({
    command: 'vault <name>',
    parent: cmd,
    description: 'Create a secret-store Vault context',
    usage: cmd.usage,
    webDocs: {
        category: 'Create Secret-Store Context',
        subCategory: 'vault',
        title: 'vault',
        weight: 10,
    },
    builder(yargs) {
        return yargs
            .options({
                apiUrl: {
                    alias: 'a',
                    describe: 'URL of the vault server',
                    required: true,
                },
                authType: {
                    choices: ['token', 'userpass', 'approle'],
                    describe: 'Authentication Type',
                    required: true,
                },
                token: {
                    alias: 't',
                    describe: 'Token',
                },
                username: {
                    describe: 'Username',
                    alias: 'u',
                },
                password: {
                    describe: 'Password',
                    alias: 'p',
                },
                roleId: {
                    describe: 'Role Id',
                    alias: 'r',
                },
                secretId: {
                    describe: 'Secret Id',
                    alias: 's',
                },
            })
            .check(buildAuthObject);
    },
    async handler(argv) {
        const data = {
            apiVersion: 'v1',
            kind: 'context',
            metadata: {
                name: argv.name,
            },
            spec: {
                type: 'secret-store.vault',
                data: {
                    sharingPolicy: argv.sharingPolicy,
                    apiUrl: argv.apiUrl,
                    auth: buildAuthObject(argv),
                },
            },
        };
        await sdk.contexts.create(data);
        console.log(`Context: ${data.metadata.name} created`);
    },
});

module.exports = command;
