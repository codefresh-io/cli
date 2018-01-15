const debug = require('debug')('codefresh:cli:create:context');
const Command = require('../../Command');
const CFError = require('cf-errors');
const _ = require('lodash');
const { pipeline } = require('../../../../logic').api;
const { specifyOutputForSingle, specifyOutputForArray } = require('../../helpers/get');
const getRoot = require('../root/get.cmd');
const DEFAULTS = require('../../defaults');



const command = new Command({
    command: 'pipelines [id]',
    aliases: ['pip', 'pipeline'],
    parent: getRoot,
    cliDocs: {
        description: 'Get a specific or an array of pipelines',
    },
    webDocs: {
        category: 'Pipelines',
        title: 'Get a single pipeline',
    },
    builder: (yargs) => {
        return yargs
            .positional('id', {
                describe: 'Pipeline id',
            })
            .option('repo-owner', {
                describe: 'Repository owner',
            })
            .option('repo-name', {
                describe: 'Repository name',
            })
            .option('limit', {
                describe: 'Limit amount of returned results',
                default: DEFAULTS.GET_LIMIT_RESULTS,
            })
            .option('page', {
                describe: 'Paginated page',
                default: DEFAULTS.GET_PAGINATED_PAGE,
            })
            .option('name', {
                describe: 'Filter results by pipeline name',
                type: Array,
            });
    },
    handler: async (argv) => {
        const id = argv.id;
        const repoOwner = argv['repo-owner'];
        const repoName = argv['repo-name'];
        const name = argv.name;
        const limit = argv.limit;
        const page = argv.page;

        let pipelines;
        // TODO:need to decide for one way for error handeling
        if (id) {
            pipelines = await pipeline.getPipelineById(id);
        } else {
            pipelines = await pipeline.getAll({
                repoOwner,
                repoName,
                name,
                limit,
                page,
            });
        }

        if (_.isArray(pipelines)) {
            specifyOutputForArray(argv.output, pipelines);
        } else {
            specifyOutputForSingle(argv.output, pipelines);
        }
    },
});

module.exports = command;

