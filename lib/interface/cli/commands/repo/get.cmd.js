const Command = require('../../Command');
const _ = require('lodash');
const { repository } = require('../../../../logic').api;
const { specifyOutputForArray } = require('../../helpers/get');
const getRoot = require('../root/get.cmd');
const Spinner = require('ora');

const command = new Command({
    command: 'repository [names..]',
    aliases: ['repo'],
    parent: getRoot,
    description: 'Add a repository',
    webDocs: {
        category: 'Repository',
        title: 'Add Repository',
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
            });
        return yargs;
    },
    handler: async (argv) => {
        const { context, names, available, limit } = argv;

        const loadRepos = available ? repository.getAllAvailableGitRepos : repository.getAllRepo;
        const contextText = context ? `git context "${context}"` : 'default user git context';
        const filterProperty = available ? 'info.repo_shortcut' : 'info.serviceName';

        const spinner = Spinner(`Loading ${available ? `git repos for ${contextText}` : 'codefresh'}`).start();
        try {
            let repos = await loadRepos(context);
            spinner.succeed('Successfully loaded repos!');


            if (!_.isEmpty(names)) {
                repos = repos.filter((r) => {
                    return names.reduce((bool, name) => bool || _.get(r, filterProperty).includes(name), false);
                });
            }
            specifyOutputForArray(argv.output, repos.slice(0, limit), argv.pretty);

            const lengthDiff = repos.length - limit;
            if (lengthDiff > 0) {
                console.log(`... ${lengthDiff} more repos available - pass greater --limit option to show more`);
            }
        } catch (e) {
            spinner.fail('Failed to load repositories:');
            console.log(`  - ${e.message}`);
        }
    },
});

module.exports = command;

