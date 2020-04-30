const Command = require('../../Command');
const CFError = require('cf-errors');
const { sdk } = require('../../../../logic');
const Project = require('../../../../logic/entities/Project');
const Output = require('../../../../output/Output');
const _ = require('lodash');
const DEFAULTS = require('../../defaults');
const { ignoreHttpError } = require('../../helpers/general');

const getRoot = require('../root/get.cmd');

const command = new Command({
    command: 'projects [id|name]',
    aliases: ['project'],
    parent: getRoot,
    description: 'Get a specific project or an array of projects',
    webDocs: {
        category: 'Projects',
        title: 'Get Projects',
    },
    builder: yargs => yargs
        .positional('id|name', {
            describe: 'Project id or name to get one project',
        })
        .option('name', {
            alias: 'n',
            describe: 'Project name to filter by',
        })
        .option('tag', {
            alias: 't',
            describe: 'Project tags array to filter by',
            array: true,
        })
        .option('limit', {
            describe: 'Limit amount of returned results',
            default: DEFAULTS.GET_LIMIT_RESULTS,
        })
        .option('page', {
            describe: 'Paginated page',
            default: DEFAULTS.GET_PAGINATED_PAGE,
        }),
    handler: async (argv) => {
        const { id, name, limit, page, tag: tags } = argv; // eslint-disable-line
        const offset = (page - 1) * limit;

        let projects;
        if (id) {
            let project = await sdk.projects.get({ id }).catch(ignoreHttpError);
            project = project || await sdk.projects.getByName({ name, tags }).catch(ignoreHttpError);
            projects = project ? [project] : [];
        } else {
            const result = await sdk.projects.list({
                name,
                tags,
                limit,
                offset,
            });
            projects = result.projects || []; // eslint-disable-line
        }
        if (!projects.length) {
            throw new CFError('No projects found');
        }
        Output.print(_.map(projects, Project.fromResponse));
    },
});

module.exports = command;
