const debug = require('debug')('codefresh:cli:create:context');
const Command = require('../../Command');
const CFError = require('cf-errors');
const _ = require('lodash');
const DEFAULTS = require('../../defaults');
const { workflow , pipeline } = require('../../../../logic').api;
const { specifyOutputForSingle, specifyOutputForArray } = require('../../helpers/get');
const getRoot = require('../root/get.cmd');
const { printError } = require('../../helpers/general');

const command = new Command({
    command: 'builds [id..]',
    aliases: ['build'],
    parent: getRoot,
    description: 'Get a specific build or an array of builds',
    usage: 'Passing [id] argument will cause a retrieval of a specific build.\n In case of not passing [id] argument, a list will be returned',
    webDocs: {
        category: 'Builds',
        title: 'Get Build',
    },
    builder: (yargs) => {
        return yargs
            .positional('id', {
                describe: 'Build id',
            })
            .option('limit', {
                describe: 'Limit amount of returned results',
                default: DEFAULTS.GET_LIMIT_RESULTS,
            })
            .option('page', {
                describe: 'Paginated page',
                default: DEFAULTS.GET_PAGINATED_PAGE,
            })
            .option('status', {
                describe: 'Filter results by statuses',
                type: Array,
                choices: ['pending', 'elected', 'error', 'running', 'success', 'terminated'],
            })
            .option('trigger', {
                describe: 'Filter results by triggers',
                type: Array,
                choices: ['build', 'launch'],
            })
            .option('pipeline-id', {
                describe: 'Filter results by pipeline id',
                type: Array,
                default: [],
            })
            .option('pipeline-name', {
                describe: 'Filter results by pipeline name',
                type: Array,
                default: [],
            })
            .example('codefresh get build ID', 'Get build ID')
            .example('codefresh get builds', 'Get all builds')
            .example('codefresh bet builds --pipeline-id ID', 'Get all builds that are executions of pipeline "ID"')
            .example('codefresh get builds --pipeline-name NAME', 'Get all builds that are executions of pipelines that are named "NAME"')
            .example('codefresh get builds --status=error', 'Get all builds that their status is error');

    },
    handler: async (argv) => {
        const workflowIds = argv.id;
        const limit = argv.limit;
        const page = argv.page;
        const status = argv.status;
        const trigger = argv.trigger;
        const pipelineNames = !_.isArray(argv['pipeline-name']) ? [(argv['pipeline-name'])] : argv['pipeline-name'];
        const pipelineIds = !_.isArray(argv['pipeline-id']) ? [(argv['pipeline-id'])] : argv['pipeline-id'];

        let workflows = [];
        // TODO:need to decide for one way for error handeling
        if (!_.isEmpty(workflowIds)) {
            for (const id of workflowIds) {
                const currWorkflow = await workflow.getWorkflowById(id);
                workflows.push(currWorkflow);
            }
        } else {
            if (!_.isEmpty(pipelineNames)) {
                const pipelines = await pipeline.getAll({
                    name: pipelineNames,
                });
                if (!_.isEmpty(pipelines)) {
                    const MatchPipelines = _.isArray(pipelines) ? pipelines : [pipelines];
                    _.forEach(MatchPipelines, (currPipeline) => {
                        pipelineIds.push(currPipeline.info.id);
                    });
                } else if (_.isEmpty(pipelineIds)) {
                    throw new CFError('Cannot find any builds with these pipelines names');
                }
            }
            workflows = await workflow.getWorkflows({
                limit,
                page,
                status,
                trigger,
                pipelineIds,
            });
        }
        specifyOutputForArray(argv.output, workflows);
    },
});

module.exports = command;
