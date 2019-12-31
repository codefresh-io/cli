const Command = require('../../Command');
const CFError = require('cf-errors');
const { sdk } = require('../../../../logic');

const applyRoot = require('../root/apply.cmd');
const { ignoreHttpError } = require('../../helpers/general');

const command = new Command({
    command: 'agent [id|name]',
    aliases: [],
    parent: applyRoot,
    description: 'Patch an agent',
    webDocs: {
        category: 'Agents',
        title: 'Patch Agent',
    },
    builder: (yargs) => {
        yargs
            .positional('id|name', {
                describe: 'agent id or name',
            })
            .option('newName', {
                describe: 'New name',
                alias: 'n',
            })
            .option('runtime', {
                array: true,
                alias: 're',
                describe: 'Agent runtimes',
            })
            .example(
                'codefresh patch agent ID --new-name NEW_NAME',
                'Replace agent name. Specifying agent by ID',
            )
            .example(
                'codefresh patch agent NAME -re runtime1',
                'Replace agent runtimes. Specifying agent by NAME',
            );

        return yargs;
    },
    handler: async (argv) => {
        const { id, name } = argv;

        const {
            newName,
            runtime,
        } = argv;

        let project = await sdk.projects.get({ id }).catch(ignoreHttpError);
        project = project || await sdk.projects.getByName({ name }).catch(ignoreHttpError);
        if (!project) {
            throw new CFError(`No such project: "${name || id}"`);
        }

        await sdk.projects.patch({ id: project.id }, { projectName, tags, variables });
        console.log(`Project: "${name || id}" patched.`);
    },
});

module.exports = command;
