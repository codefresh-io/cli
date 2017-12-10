const debug           = require('debug')('codefresh:cli:create:context');
const CFError         = require('cf-errors');
const _               = require('lodash');
const { wrapHandler } = require('../../../helper');
const { pipeline }    = require('../../../../../logic').api;
const Table           = require('cli-table');
const columnify       = require('columnify');
const { specifyOutputForSingle , specifyOutputForArray } = require('../helper');


const command = 'pipelines [repo-owner] [repo-name] [name]';

const builder = (yargs) => {
    return yargs
        .positional('name', {
            describe: 'Pipeline name',
        })
        .positional('repo-owner', {
            describe: 'Repository owner',
        })
        .positional('repo-name', {
            describe: 'Repository name',
        });
};

const handler = async (argv) => {
    const pipelineName = argv.name;
    const repoOwner    = argv['repo-owner'];
    const repoName     = argv['repo-name'];

    let pipelines;
    // TODO:need to decide for one way for error handeling
    if (pipelineName && repoOwner && repoName) {
        pipelines = await pipeline.getPipelineByNameAndRepo(pipelineName, repoOwner, repoName);
        specifyOutputForSingle(argv.output, pipelines);
    } else if (repoOwner && repoName) {
        pipelines = await pipeline.getAllByRepo(repoOwner, repoName);
        specifyOutputForArray(argv.output, pipelines);
    } else {
        pipelines = await pipeline.getAll();
        specifyOutputForArray(argv.output, pipelines);
    }
};

module.exports = {
    command,
    builder,
    handler: wrapHandler(handler),
};
