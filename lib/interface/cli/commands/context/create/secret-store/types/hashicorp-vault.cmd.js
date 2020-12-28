const Command = require('../../../../../Command');
const CFError = require('cf-errors');
const cmd = require('../base.cmd');
const { sdk } = require('../../../../../../../logic');

function buildAuthObject({ token, username, password, roleId, secretId, loginPath, gcpRole, kubernetesRole, kubernetesJwt, behindFirewall }) {
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

    if (gcpRole) {
        if (!behindFirewall) {
            throw new Error('GCP must be behind firewall');
        }

        return { type: 'gcp', roleType: 'gce', role: gcpRole, ...mountPoint };
    }

    if (kubernetesRole) {
        if (!behindFirewall && !kubernetesJwt) {
            throw new Error('Using Kubernetes without providing --kubernetes-jwt requires the --behind-firewall option to be set');
        }

        return {
            type: 'kubernetes',
            role: kubernetesRole,
            ...(kubernetesJwt && { jwt: kubernetesJwt }),
            ...mountPoint,
        };
    }

    throw new CFError('missing authentication info');
}

const command = new Command({
    command: 'hashicorp-vault <name>',
    parent: cmd,
    description: 'Create a Hashicorp Vault secret-store context',
    usage: cmd.usage,
    webDocs: {
        category: 'Create Secret-Store Context',
        subCategory: 'hashicorp-vault',
        title: 'hashicorp-vault',
        weight: 10,
    },
    builder(yargs) {
        return yargs
            .option('behind-firewall', {
                describe: 'Set to true to mark this context with behind firewall flag',
                type: 'boolean',
                default: false,
            })
            .option('api-url', {
                alias: 'a',
                describe: 'URL of the vault server',
                type: 'string',
                required: true,
            })
            .option('login-path', {
                describe: 'Path for given auth method. Leave out to use the default path for the type.',
                type: 'string',
            })
            .option('token', {
                alias: 't',
                describe: 'Token',
                type: 'string',
                conflicts: ['username', 'password', 'roleId', 'secretId', 'gcp-role', 'kubernetes-role', 'kubernetes-jwt'],
            })
            .option('username', {
                describe: 'Username',
                alias: 'u',
                type: 'string',
                conflicts: ['token', 'roleId', 'secretId', 'gcp-role', 'kubernetes-role', 'kubernetes-jwt'],
            })
            .option('password', {
                describe: 'Password',
                alias: 'p',
                type: 'string',
                conflicts: ['token', 'roleId', 'secretId', 'gcp-role', 'kubernetes-role', 'kubernetes-jwt'],
            })
            .option('role-id', {
                describe: 'Role Id',
                alias: 'r',
                type: 'string',
                conflicts: ['token', 'username', 'password', 'gcp-role', 'kubernetes-role', 'kubernetes-jwt'],
            })
            .option('secret-id', {
                describe: 'Secret Id',
                alias: 's',
                type: 'string',
                conflicts: ['token', 'username', 'password', 'gcp-role', 'kubernetes-role', 'kubernetes-jwt'],
            })
            .option('gcp-role', {
                describe: 'GCP Role',
                type: 'string',
                // implies: 'behind-firewall',
                conflicts: ['token', 'username', 'password', 'role-id', 'secret-id', 'kubernetes-role', 'kubernetes-jwt'],
            })
            .option('kubernetes-role', {
                describe: 'Kubernetes Role',
                type: 'string',
                // implies: 'behind-firewall',
                conflicts: ['token', 'username', 'password', 'role-id', 'secret-id', 'gcp-role'],
            })
            .option('kubernetes-jwt', {
                describe: 'Kubernetes Role',
                type: 'string',
                // implies: 'behind-firewall',
                conflicts: ['token', 'username', 'password', 'role-id', 'secret-id', 'gcp-role'],
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
