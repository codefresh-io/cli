const Command = require('../../Command');
const CFError = require('cf-errors');
const _ = require('lodash');
const { sdk } = require('../../../../logic');
const createRoot = require('../root/create.cmd');
const { prepareKeyValueObjectsFromCLIEnvOption, ignoreHttpError } = require('../../helpers/general');

const command = new Command({
    command: 'project <name>',
    parent: createRoot,
    description: 'Create a project',
    usage: 'You can create a project specifying name unique for account.',
    webDocs: {
        category: 'Projects',
        title: 'Create Project',
    },
    builder: (yargs) => {
        return yargs
            .positional('name', {
                describe: 'Name of project',
            })
            .option('tag', {
                array: true,
                alias: 't',
                describe: 'Project tags',
                default: [],
            })
            .option('variable', {
                array: true,
                alias: 'v',
                describe: 'Project variables',
                default: [],
                coerce: prepareKeyValueObjectsFromCLIEnvOption,
            })
            .option('encrypted', {
                array: true,
                alias: 'e',
                describe: 'Variable names to encrypt',
                default: [],
            })
            .example('codefresh create project NAME', 'Create a project')
            .example('codefresh create project NAME -t test -t run', 'Create a project with tags: [ "test", "run"]')
            .example('codefresh create project NAME -v test=true -v run=false', 'Create a project with specific variables')
            .example('codefresh create project NAME -v secret=secret -e secret', 'Create a project with encrypted variables');
    },
    handler: async (argv) => {
        const {
            name: projectName,
            tag: tags,
            variable: variables,
            encrypted,
        } = argv;

        const variableMap = _.reduce(variables, (acc, v) => _.assign(acc, { [v.key]: v }), {});
        _.forEach(encrypted, (varName) => {
            const variable = variableMap[varName];
            if (!variable) {
                throw new CFError(`Variable is not provided: "${varName}"`);
            }
            variable.encrypted = true;
        });

        const existing = await sdk.projects.getByName({ name: projectName }).catch(ignoreHttpError); // ignore not found error
        if (existing) {
            throw new CFError(`Project already exists: "${projectName}"`);
        }

        await sdk.projects.create({ projectName, tags, variables });
        console.log(`Project: "${projectName}" created`);
    },
});

module.exports = command;
