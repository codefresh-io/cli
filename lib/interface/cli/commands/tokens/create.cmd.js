const _ = require('lodash');
const Command = require('../../Command');
const createCmd = require('../root/create.cmd');
const CFError = require('cf-errors');
const { sdk } = require('../../../../logic');


const command = new Command({
    command: 'token [name]',
    parent: createCmd,
    description: 'Generate Codefresh token',
    usage: 'Create default token or provide --type and --subject. See options for more details.',
    webDocs: {
        category: 'Tokens',
        title: 'Create tokens',
        weight: 10,
    },
    builder: (yargs) => {
        return yargs
            .option('subject', {
                describe: 'Name of the token subject',
            })
            .option('type', {
                describe: 'Type of the subject',
                choices: ['runtime-environment', 'user'],
                default: 'user',
            })
            .option('scope', {
                alias: 's',
                describe: 'user scopes',
                array: true,
            })
            .positional('name', {
                describe: 'token name',
                required: true,
            })
            .example('codefresh create token some-token', 'Create token with default type')
            .example(
                'codefresh create token some-token --subject my-k8s-cluster/namespace --type runtime-environment',
                'Create token from runtime environment',
            );
    },
    handler: async (argv) => {
        if (_.isEmpty(argv.name)) {
            throw new CFError('Token name must be provided');
        }
        if (argv.type === 'user' && _.isEmpty(argv.scope)) {
            throw new CFError('Token of type "user" name must have at least one scope');
        }

        if (argv.type === 'runtime-environment' && !argv.subject) {
            throw new CFError('Type "runtime-environment" needs --subject to be provided');
        }

        const res = await sdk.tokens.generate({
            subjectType: argv.type,
            subjectReference: argv.subject,
        }, {
            name: argv.name,
            scopes: argv.scope,
        });

        console.log('Token created:');
        console.log(res);
    },
});

module.exports = command;

