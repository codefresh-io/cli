const Command = require('../../../../../Command');
const CFError = require('cf-errors');
const cmd = require('../base.cmd');
const { sdk } = require('../../../../../../../logic');

function buildAuthObject({ token, username, password, roleId, secretId, loginPath }) {
    const mountPoint = loginPath ? { mount_point: loginPath } : {};
    if (token) {
        return { type: 'token', token, ...mountPoint };
    }

    if (username && password) {
        return { type: 'userpass', username, password, ...mountPoint };
    }

    if (roleId && secretId) {
        return { type: 'approle', role_id: roleId, secret_id: secretId, ...mountPoint };
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
                type: 'string',
                required: true,
            })
            .option('token', {
                alias: 't',
                describe: 'Token',
                type: 'string',
                conflicts: ['username', 'password', 'roleId', 'secretId'],
            })
            .option('username', {
                describe: 'Username',
                alias: 'u',
                type: 'string',
                conflicts: ['token', 'roleId', 'secretId'],
            })
            .option('password', {
                describe: 'Password',
                alias: 'p',
                type: 'string',
                conflicts: ['token', 'roleId', 'secretId'],
            })
            .option('role-id', {
                describe: 'Role Id',
                alias: 'r',
                type: 'string',
                conflicts: ['token', 'username', 'password'],
            })
            .option('secret-id', {
                describe: 'Secret Id',
                alias: 's',
                type: 'string',
                conflicts: ['token', 'username', 'password'],
            })
            .option('login-path', {
                describe: 'Path for given auth method. Leave out to use the default path for the type.',
                type: 'string',
            })
            .option('behind-firewall', {
                describe: 'Set to true to mark this context with behind firewall flag',
                type: 'boolean',
                default: false,
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
                    behindFirewall: argv.behindFirewall,
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
