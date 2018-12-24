const debug = require('debug')('codefresh:cli:generate:imagePullSecret');
const Command = require('../../Command');
const genCmd = require('../root/generate.cmd');
const {
    generateToken,
} = require('../../../../logic/api/token');

const command = new Command({
    command: 'runtime-environment-token',
    aliases: ['re-token'],
    parent: genCmd,
    description: 'Generage Codefresh token for Runtime Environment',
    usage: 'Generage Codefresh token for Runtime Environment',
    webDocs: {
        category: 'Runtime-Environments',
        title: 'Runtime-Environments tokens',
    },
    builder: (yargs) => {
        return yargs
            .option('subject', {
                describe: 'name of the runtime-environment',
                required: true,
            })
            .option('name', {
                describe: 'token name',
                required: true,
            })
            .example('codefresh generate runtime-environment-token --subject my-k8s-cluster/namespace --name new-token', 'Generate runtime environment token');
    },
    handler: async (argv) => {
        const res = await generateToken({
            subjectType: 'runtime-environment',
            subjectReference: argv.subject,
            name: argv.name,
        });
        console.log('Token created');
        console.log(res.token);
    },
});

module.exports = command;

