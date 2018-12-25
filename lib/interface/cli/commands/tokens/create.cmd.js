const debug = require('debug')('codefresh:cli:create:token');
const Command = require('../../Command');
const createCmd = require('../root/create.cmd');
const {
    generateToken,
} = require('../../../../logic/api/token');

const command = new Command({
    command: 'tokens',
    aliases: ['token'],
    parent: createCmd,
    description: 'Create Codefresh token',
    usage: 'Create Codefresh token',
    webDocs: {
        category: 'Tokens',
        title: 'Tokens tokens',
    },
    builder: (yargs) => {
        return yargs
            .option('subject', {
                describe: 'name of the token subject',
                required: true,
            })
            .option('type', {
                describe: 'Type of the subject',
                default: 'runtime-environment',
                options: ['runtime-environment'],
            })
            .option('name', {
                describe: 'token name',
                required: true,
            })
            .example('codefresh create token --subject my-k8s-cluster/namespace --name new-token', 'Create token form runtime environment');
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

