const debug = require('debug')('codefresh:cli:create:context');
const Command = require('../../Command');
const CFError = require('cf-errors');
const _ = require('lodash');
const { repository } = require('../../../../logic').api;
const addRoot = require('../root/add.cmd');
const yargs = require('yargs');

const command = new Command({
    command: 'repository [fullname]',
    aliases: ['repo'],
    parent: addRoot,
    description: 'Add a repository',
    webDocs: {
        category: 'Repository',
        title: 'Add Repository',
    },
    builder: (yargs) => {
        yargs
            .positional('fullname', {
                describe: 'Full name of repo (template: "<owner>/<repo>")',
                required: true,
            })
            .option('context', {
                describe: 'Name of the git context to use, if not passed the default will be used',
                alias: 'c',
            });
        return yargs;
    },
    handler: async (argv) => {
        let { context, fullname } = argv;

        if (!fullname) {
            console.log('Full repo name is not provided');
            return;
        }

        const [owner, repoName] = fullname.split('/');
        if (!owner) {
            console.log('Owner name not provided!');
            console.log('Please follow the repo name template: "<owner>/<repo>"');
            return;
        }
        if (!repoName) {
            console.log('Repo name not provided!');
            console.log('Please follow the repo name template: "<owner>/<repo>"');
            return;
        }

        try {
            // throws on not found
            const gitRepo = await repository.getAvailableGitRepo(owner, repoName, context);
            console.log(`Found repository "${gitRepo.name}" at context "${context || gitRepo.provider}"`);
            if (!context) {
                context = gitRepo.provider;
            }

            // following the ui logic on duplication
            const existing = await repository.getRepo(fullname, context).catch(() => null); // throws on not found
            if (existing) {
                const contextPrefix = `${context}-${context}`;
                console.log(`Repo with such name already exists -- adding context prefix: ${contextPrefix}`);
                fullname = `${contextPrefix}/${fullname}`;
            }

            // throws on duplicate, not found, other errors...
            await repository.createRepository(fullname, owner, repoName, context);
            console.log(`Repository added: ${fullname}`);
        } catch (e) {
            console.log('Cannot add repository:');
            console.log(`  - ${e.message.replace('service', 'repo')}`);
        }
    },
});

module.exports = command;

