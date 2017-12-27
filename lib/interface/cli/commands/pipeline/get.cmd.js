const debug = require('debug')('codefresh:cli:create:context');
const Command = require('../../Command');
const CFError = require('cf-errors');
const _ = require('lodash');
const { pipeline } = require('../../../../logic').api;
const { specifyOutputForSingle, specifyOutputForArray } = require('../../helpers/get');
const getRoot = require('../root/get.cmd');


const command = new Command({
    command: 'pipelines [id|name] [repo-owner] [repo-name]',
    description: 'Get pipelines',
    builder: (yargs) => {
        return yargs
            .positional('id', {
                describe: 'Pipeline name or id',
            })
            .positional('repo-owner', {
                describe: 'Repository owner',
            })
            .positional('repo-name', {
                describe: 'Repository name',
            })
            .option('source-control', {
                describe: 'Filter results by source control',
                type: Array,
                choices: ['github', 'bitbucket'],
            })
            .option('pipeline-name', {
                describe: 'Filter results by pipeline name',
                type: Array,
            });
    },
    handler: async (argv) => {
        const id = argv.id;
        const repoOwner = argv['repo-owner'];
        const repoName = argv['repo-name'];
        const provider = argv['source-control'];
        const pipelineName = argv['pipeline-name'];

        let pipelines;
        // TODO:need to decide for one way for error handeling
        if (id && repoOwner && repoName) {
            pipelines = await pipeline.getPipelineByNameAndRepo(id, repoOwner, repoName, provider);
        } else if (id) {
            pipelines = await pipeline.getPipelineById(id);
        } else if (repoOwner && repoName) {
            pipelines = await pipeline.getAllByRepo(repoOwner, repoName, provider, pipelineName);
        } else {
            pipelines = await pipeline.getAll(provider, pipelineName);
        }

        if (_.isArray(pipelines)) {
            specifyOutputForArray(argv.output, pipelines);
        } else {
            specifyOutputForSingle(argv.output, pipelines);
        }
    },
});
getRoot.subCommand(command);


module.exports = command;

