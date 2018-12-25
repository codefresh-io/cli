const debug = require('debug')('codefresh:cli:generate:imagePullSecret');
const Command = require('../../Command');
const genCmd = require('../root/generate.cmd');
const {
    generateToken,
} = require('../../../../logic/api/token');

const command = new Command({
    command: 'tokens',
    aliases: ['token'],
    parent: genCmd,
    description: 'Generage Codefresh token',
    usage: 'Generage Codefresh token',
    webDocs: {
        category: 'Tokens',
        title: 'Tokens tokens',
    },
    builder: (yargs) => {
        return yargs
            .option('subject', {
                describe: 'name of the runtime-environment',
                required: true,
            })
            .options('type', {
                describe: 'Type of the subject',
                default: 'runtime-environment',
                options: ['runtime-environment'],
            })
            .option('name', {
                describe: 'token name',
                required: true,
            })
            .example('codefresh generate token --subject my-k8s-cluster/namespace --name new-token', 'Generate token form runtime environment');
    },
    handler: async (argv) => {
        const res = await generateToken({
            subjectType: argv.type,
            subjectReference: argv.subject,
            name: argv.name,
        });
        console.log('Token created');
        console.log(res.token);
    },
});

module.exports = command;

