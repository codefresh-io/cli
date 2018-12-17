const Command = require('../../Command');
const { repository } = require('../../../../logic').api;
const addRoot = require('../root/add.cmd');

const command = new Command({
    command: 'repository [fullname]',
    aliases: ['repo'],
    parent: addRoot,
    description: 'Add a repository from git context to codefresh',
    webDocs: {
        category: 'Repository',
        title: 'Add Repository',
        weight: 10,
    },
    builder: (yargs) => {
        yargs
            .positional('fullname', {
                describe: 'Full name of repo (template: "owner/repo")',
                required: true,
            })
            .option('context', {
                describe: 'Name of the git context to use, if not passed the default will be used',
                alias: 'c',
            })
            .example('codefresh add repo codefresh-io/some-repo', 'Add repo "some-repo" of "codefresh-io" owner from default git context')
            .example('codefresh add repo codefresh-io/some-repo -c bitbucket', 'Add repo "some-repo" of "codefresh-io" owner from git context "bitbucket"');
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
            try {
                await repository.get(fullname, context);
                const contextPrefix = `${context}-${context}`;
                console.log(`Repo with such name already exists -- adding context prefix: ${contextPrefix}`);
                fullname = `${contextPrefix}/${fullname}`; // aka github-github/codefresh-io/cf-api
            } catch (e) {
                // if response is "not found" - all is ok, else re-throw
                if (!e.statusCode || e.statusCode !== 404) {
                    throw e;
                }
            }

            // throws on duplicate, not found, other errors...
            await repository.create(fullname, owner, repoName, context);
            console.log(`Repository added: ${fullname}`);
        } catch (e) {
            console.log('Cannot add repository:');
            console.log(`  - ${e.message.replace('service', 'repo')}`);
        }
    },
});

module.exports = command;

