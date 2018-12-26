const _ = require('lodash');
const Command = require('../../Command');
const replaceCmd = require('../root/replace.cmd');
const { token } = require('../../../../logic').api;

const command = new Command({
    command: 'token [name]',
    parent: replaceCmd,
    description: 'Replace Codefresh token',
    webDocs: {
        category: 'Tokens',
        title: 'Replace tokens',
    },
    builder: (yargs) => {
        return yargs
            .option('subject', {
                describe: 'Name of the token subject',
            })
            .option('type', {
                describe: 'Type of the subject',
                options: ['runtime-environment', 'user'],
                default: 'user',
            })
            .positional('name', {
                describe: 'token name',
                required: true,
            })
            .example('codefresh replace token some-token', 'Simply regenerate with default subject type')
            .example(
                'codefresh replace token some-token --subject my-k8s-cluster/namespace --type runtime-environment',
                'Create token form runtime environment',
            );
    },
    handler: async (argv) => {
        let tokens = await token.getTokens();
        tokens = tokens.filter(t => t.info.name === argv.name);

        if (argv.type === 'runtime-environment' && !argv.subject) {
            console.log('Type "runtime-environment" needs --subject to be provided');
            return;
        }

        if (_.isEmpty(tokens)) {
            console.log(`Token not found with name: ${argv.name}`);
            return;
        }

        const targetToken = tokens[0];
        await token.deleteToken(targetToken.info.id);

        const result = await token.generateToken({
            subjectType: argv.type,
            subjectReference: argv.subject,
            name: argv.name,
        });

        console.log(`Token "${argv.name}" regenerated:`);
        console.log(result.token);
    },
});

module.exports = command;

