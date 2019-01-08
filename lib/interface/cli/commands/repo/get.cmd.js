const Command = require('../../Command');
const _ = require('lodash');
const { repository, context: Context } = require('../../../../logic').api;
const Output = require('../../../../output/Output');
const getRoot = require('../root/get.cmd');
const Spinner = require('ora');
const CFError = require('cf-errors'); // eslint-disable-line

const command = new Command({
    command: 'repository [names..]',
    aliases: ['repo'],
    parent: getRoot,
    description: 'You can either get codefresh repos (previously added) or any repo from your git context (using option "--available" and "--context")',
    webDocs: {
        category: 'Repository',
        title: 'Get Repositories',
        weight: 20,
    },
    builder: (yargs) => {
        yargs
            .positional('names', {
                describe: 'Names for filtering repos',
            })
            .option('available', {
                describe: 'Get all available git repos from provided or default git context',
                alias: 'a',
            })
            .option('limit', {
                describe: 'Maximum displayed repos number',
                alias: 'l',
                default: 25,
            })
            .option('context', {
                describe: 'Name of the git context to use, if not passed the default will be used',
                alias: 'c',
            })
            .example('codefresh get repo', 'Get all codefresh repos')
            .example('codefresh get repo codefresh-io', 'Get codefresh repos containing "codefresh-io" in its name')
            .example('codefresh get repo some-repo', 'Get codefresh repos containing "some-repo" in its name')
            .example('codefresh get repo -a', 'Get all available repos from default git context')
            .example('codefresh get repo -a -c bitbucket', 'Get all available repos from "bitbucket" git context');
        return yargs;
    },
    handler: async (argv) => {
        let { context, names, available, limit } = argv;

        let ctxList = await Context.getContexts({});
        ctxList = ctxList.filter(c => c.type.startsWith('git')
            && ((context && c.name === context) || (!context && c.info.metadata.default)));

        if (_.isEmpty(ctxList)) {
            throw new CFError(context ? `No such context: ${context}` : 'Default git context is not specified');
        }

        let contextText;
        if (!context) {
            context = ctxList[0].name;
            contextText = `default user git context: "${context}"`;
        } else {
            contextText = `git context: "${context}"`;
        }

        const loadRepos = available ? repository.getAllAvailableGitRepos : repository.getAll;
        const filterProperty = available ? 'info.repo_shortcut' : 'info.serviceName';

        const spinner = Spinner(`Loading git repos for ${contextText}`);
        if (available) {
            spinner.start();
        }
        try {
            let repos = await loadRepos(context);
            spinner.stop();

            if (!_.isEmpty(names)) {
                repos = repos.filter((r) => {
                    return names.reduce((bool, name) => bool || _.get(r, filterProperty).includes(name), false);
                });
            }
            Output.print(repos.slice(0, limit));

            const lengthDiff = repos.length - limit;
            if (lengthDiff > 0) {
                console.log(`... ${lengthDiff} more repos available - pass greater --limit option to show more`);
            }
        } catch (e) {
            spinner.stop();
            throw new CFError({
                message: 'Failed to load repositories',
                cause: e,
            });
        }
    },
});

module.exports = command;

