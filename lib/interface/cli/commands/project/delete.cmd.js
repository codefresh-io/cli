const Command = require('../../Command');
const CFError = require('cf-errors');
const { sdk } = require('../../../../logic');
const deleteRoot = require('../root/delete.cmd');
const { ignoreHttpError } = require('../../helpers/general');

const command = new Command({
    command: 'project <id|name>',
    aliases: [],
    parent: deleteRoot,
    description: 'Delete a project',
    webDocs: {
        category: 'Projects',
        title: 'Delete project',
    },
    builder: (yargs) => {
        yargs
            .positional('id|name', {
                describe: 'project id or name',
            })
            .example('codefresh delete project NAME', 'Delete project by name.')
            .example('codefresh delete project ID', 'Delete project by Id.');
        return yargs;
    },
    handler: async (argv) => {
        const { id, name } = argv;

        let project = await sdk.projects.get({ id }).catch(ignoreHttpError);
        project = project || await sdk.projects.getByName({ name }).catch(ignoreHttpError);
        if (!project) {
            throw new CFError(`No such project: "${name || id}"`);
        }

        await sdk.projects.delete({ id: project.id });
        console.log(`Project '${name || id}' deleted.`);
    },
});

module.exports = command;
