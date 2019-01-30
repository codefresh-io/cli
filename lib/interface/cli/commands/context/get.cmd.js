const Command = require('../../Command');
const _ = require('lodash');
const { context } = require('../../../../logic').api;
const Output = require('../../../../output/Output');
const getRoot = require('../root/get.cmd');
const Promise = require('bluebird');

const command = new Command({
    command: 'contexts [name..]',
    aliases: ['ctx', 'context'],
    parent: getRoot,
    description: 'Get a specific context or an array of contexts',
    usage: 'Passing [name] argument will cause a retrieval of a specific context.\n In case of not passing [name] argument, a list will be returned',
    webDocs: {
        category: 'Contexts',
        title: 'Get Context',
    },
    builder: (yargs) => {
        return yargs
            .positional('name', {
                describe: 'context name',
            })
            .option('type', {
                describe: 'Context type',
                choices: [
                    'config', 'git.bitbucket-server', 'git.bitbucket', 'git.github', 'git.gitlab',
                    'git.stash', 'helm-repository', 'secret-yaml', 'secret', 'storage.gc', 'storage.s3', 'yaml',
                ],
            })
            .option('decrypt', {
                describe: 'Either to show decoded credentials or not',
            })
            .example('codefresh get context NAME', 'Get context NAME')
            .example('codefresh get contexts', 'Get all contexts')
            .example('codefresh get context --decrypt', 'Get all contexts with credentials decrypted')
            .example('codefresh get context --type secret', 'Get all secret contexts')
            .example('codefresh get context --type git.github', 'Get all git based contexts for github kind')
            .example('codefresh get context --type helm-repository', 'Get all helm-repository contexts');
    },
    handler: async (argv) => {
        const data = {};
        const names = argv.name;
        if (argv.type) {
            data.type = argv.type;
        }
        data.decrypt = argv.decrypt;

        let contexts = [];
        if (!_.isEmpty(names)) {
            contexts = await Promise.map(names, name => context.getContextByName(name, data.decrypt));
        } else {
            contexts = await context.getContexts(data);
        }
        Output.print(contexts);
    },
});

module.exports = command;
