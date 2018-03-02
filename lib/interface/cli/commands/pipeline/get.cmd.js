const debug = require('debug')('codefresh:cli:create:context');
const Command = require('../../Command');
const CFError = require('cf-errors');
const _ = require('lodash');
const { pipeline } = require('../../../../logic').api;
const { specifyOutputForSingle, specifyOutputForArray } = require('../../helpers/get');
const getRoot = require('../root/get.cmd');
const DEFAULTS = require('../../defaults');



const command = new Command({
    command: 'pipelines [id..]',
    aliases: ['pip', 'pipeline'],
    parent: getRoot,
    description: 'Get a specific pipeline or an array of pipelines',
    usage: 'Passing [id] argument will cause a retrieval of a specific pipeline.\n In case of not passing [id] argument, a list will be returned',
    webDocs: {
        category: 'Pipelines',
        title: 'Get Pipeline',
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
            })
            .example('codefresh get pipeline ID', 'Get pipeline ID')
            .example('codefresh get pipelines', 'Get all pipelines')
            .example('codefresh get pipelines --name release', 'Get all pipelines that their name is release')
            .example('codefresh get pipelines --repo-name node', "Get all pipelines that are associated with the repository name 'node'");
    },
    handler: async (argv) => {
        const pipelineIds = argv.id;
        const repoOwner = argv['repo-owner'];
        const repoName = argv['repo-name'];
        const name = argv.name;
        const limit = argv.limit;
        const page = argv.page;

        let pipelines = [];
        if (!_.isEmpty(pipelineIds)) {
            for (const id of pipelineIds) {
                const currPipeline = await pipeline.getPipelineById(id);
                pipelines.push(currPipeline);
            }
        } else {
            pipelines = await pipeline.getAll({
                repoOwner,
                repoName,
                name,
                limit,
                page,
            });
        }
        specifyOutputForArray(argv.output, pipelines);
    },
});

module.exports = command;

