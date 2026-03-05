const Command = require('../../Command');
const _ = require('lodash');
const Output = require('../../../../output/Output');
const getRoot = require('../root/get.cmd');
const Promise = require('bluebird');
const { sdk } = require('../../../../logic');
const Context = require('../../../../logic/entities/Context');

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
                    'config', 'git.bitbucket-server', 'git.bitbucket', 'git.github', 'git.github-app',
                    'git.codefresh-github-app', 'git.gitlab', 'git.stash', 'helm-repository', 'secret-yaml', 'secret',
                    'storage.gc', 'storage.s3', 'yaml', 'secret-store.kubernetes', 'secret-store.kubernetes-runtime',
                ],
            })
            .option('decrypt', {
                describe: 'Either to show decoded credentials or not',
            })
            .option('prepare', {
                describe: 'Activate tokens in case its invalid. It\'s supported only for types: '
                    + '`git.codefresh-github-app`, `git.github-app` and `git.bitbucket` (OAuth2)',
            })
            .option('force-prepare', {
                describe: 'Refresh the token even if the current token is still valid. Unlike `--prepare`, '
                    + 'which only refreshes expired tokens, this flag forces a token refresh unconditionally. '
                    + 'It\'s supported only for `git.bitbucket` (OAuth2)',
            })
            .example('codefresh get context NAME', 'Get context NAME')
            .example('codefresh get context NAME --prepare', 'Get context by NAME and active token if it\'s expired')
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
        data.decrypt = argv.decrypt || undefined;
        data.prepare = argv.prepare || undefined;
        data.forcePrepare = argv['force-prepare'] || undefined;

        let contexts = [];
        if (!_.isEmpty(names)) {
            if (data.forcePrepare) {
                contexts = await Promise.map(names, name => sdk.contexts.prepare({ name, forceRefresh: true }));
            } else if (data.prepare) {
                contexts = await Promise.map(names, name => sdk.contexts.prepare({ name }));
            } else {
                contexts = await Promise.map(names, name => sdk.contexts.get({ name, decrypt: data.decrypt }));
            }
        } else {
            contexts = await sdk.contexts.list(data);
        }
        Output.print(_.map(contexts, Context.fromResponse));
    },
});

module.exports = command;
