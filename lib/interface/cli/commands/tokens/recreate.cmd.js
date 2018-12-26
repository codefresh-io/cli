const _ = require('lodash');
const Command = require('../../Command');
const recreateCmd = require('../root/recreate.cmd');
const { token } = require('../../../../logic').api;

const command = new Command({
    command: 'token [name|id]',
    parent: recreateCmd,
    description: 'Delete old token with provided name or id and generate new one with the same name and new options',
    webDocs: {
        category: 'Tokens',
        title: 'Recreate token',
        weight: 30,
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
            .positional('name', {
                describe: 'token name or id',
                required: true,
            })
            .example('codefresh recreate token some-token', 'Recreate token with default subject type')
            .example('codefresh recreate token [token_id]', 'Recreate token by id')
            .example(
                'codefresh recreate token some-token --subject my-k8s-cluster/namespace --type runtime-environment',
                'Recreate token with runtime environment specified',
            );
    },
    handler: async (argv) => {
        if (_.isEmpty(argv.name)) {
            console.log('Token name or id must be provided');
            return;
        }

        let tokens = await token.getTokens();
        tokens = tokens.filter(t => t.info.name === argv.name || t.info.id === argv.name);

        if (argv.type === 'runtime-environment' && !argv.subject) {
            console.log('Type "runtime-environment" needs --subject to be provided');
            return;
        }

        if (_.isEmpty(tokens)) {
            console.log(`Token not found: '${argv.name}'`);
            return;
        }

        const targetToken = tokens[0];
        await token.deleteToken(targetToken.info.id);

        const result = await token.generateToken({
            subjectType: argv.type,
            subjectReference: argv.subject,
            name: targetToken.info.name,
        });

        console.log(`Token "${targetToken.info.name}" regenerated:`);
        console.log(result.token);
    },
});

module.exports = command;

