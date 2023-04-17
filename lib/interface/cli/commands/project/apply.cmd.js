const Command = require('../../Command');
const CFError = require('cf-errors');
const _ = require('lodash');
const { sdk } = require('../../../../logic');

const applyRoot = require('../root/apply.cmd');
const { prepareKeyValueObjectsFromCLIEnvOption, ignoreHttpError, prepareEncryptedValues} = require('../../helpers/general');

const command = new Command({
    command: 'project [id|name]',
    aliases: [],
    parent: applyRoot,
    description: 'Patch a project',
    webDocs: {
        category: 'Projects',
        title: 'Patch Project',
    },
    builder: (yargs) => {
        yargs
            .positional('id|name', {
                describe: 'project id or name',
            })
            .option('newName', {
                describe: 'New name',
                alias: 'n',
            })
            .option('tag', {
                array: true,
                alias: 't',
                describe: 'Project tags',
            })
            .option('variable', {
                array: true,
                alias: 'v',
                describe: 'Project variables',
                coerce: prepareKeyValueObjectsFromCLIEnvOption,
            })
            .option('encrypted', {
                array: true,
                alias: 'e',
                describe: 'Variable names to encrypt',
            })
            .example(
                'codefresh patch project ID --new-name NEW_NAME --tag test',
                'Replace project name and tags. Specifying project by ID',
            )
            .example(
                'codefresh patch project NAME -v test=test',
                'Replace project variables. Specifying project by NAME',
            );

        return yargs;
    },
    handler: async (argv) => {
        const { id, name } = argv;

        const {
            newName: projectName,
            tag: tags,
            variable,
            encrypted,
        } = argv;

        const variables = prepareEncryptedValues(variable, encrypted);

        let project = await sdk.projects.get({ id }).catch(ignoreHttpError);
        project = project || await sdk.projects.getByName({ name }).catch(ignoreHttpError);
        if (!project) {
            throw new CFError(`No such project: "${name || id}"`);
        }

        const { tags: existingTags, variables: existingVariables } = project;

        const updatePayload = _.pickBy({
            projectName,
            tags: tags || existingTags,
            variables: variables || existingVariables,
        }, _.identity);

        await sdk.projects.patch({ id: project.id }, updatePayload);
        console.log(`Project: "${name || id}" patched.`);
    },
});

module.exports = command;
