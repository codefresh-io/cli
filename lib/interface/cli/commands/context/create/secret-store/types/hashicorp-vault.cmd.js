const Command = require('../../../../../Command');
const CFError = require('cf-errors');
const cmd = require('../base.cmd');
const { sdk } = require('../../../../../../../logic');

function buildAuthObject({ token, username, password, roleId, secretId }) {
    if (token) {
        return { type: 'token', token };
    }

    if (username && password) {
        return { type: 'userpass', username, password };
    }

    if (roleId && secretId) {
        return { type: 'approle', role_id: roleId, secret_id: secretId };
    }

    throw new CFError('missing authentication info');
}

const command = new Command({
    command: 'hashicorp-vault <name>',
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
            .option('api-url', {
                alias: 'a',
                describe: 'URL of the vault server',
                required: true,
            })
            .option('token', {
                alias: 't',
                describe: 'Token',
                conflicts: ['username', 'password', 'roleId', 'secretId'],
            })
            .option('username', {
                describe: 'Username',
                alias: 'u',
                conflicts: ['token', 'roleId', 'secretId'],
            })
            .option('password', {
                describe: 'Password',
                alias: 'p',
                conflicts: ['token', 'roleId', 'secretId'],
            })
            .option('role-id', {
                describe: 'Role Id',
                alias: 'r',
                conflicts: ['token', 'username', 'password'],
            })
            .option('secret-id', {
                describe: 'Secret Id',
                alias: 's',
                conflicts: ['token', 'username', 'password'],
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
                type: 'secret-store.hashicorp-vault',
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
