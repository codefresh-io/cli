const debug                                             = require('debug')('codefresh:cli:create:context');
const CFError                                           = require('cf-errors');
const _                                                 = require('lodash');
const { wrapHandler }                                   = require('../../../helper');
const { pipeline }                                      = require('../../../../../logic').api;
const Table                                             = require('cli-table');
const columnify                                         = require('columnify');
const { specifyOutputForSingle, specifyOutputForArray } = require('../helper');


const command = 'pipelines [id|name] [repo-owner] [repo-name]';

const builder = (yargs) => {
    return yargs
        .positional('id', {
            describe: 'Pipeline name or id',
        })
        .positional('repo-owner', {
            describe: 'Repository owner',
        })
        .positional('repo-name', {
            describe: 'Repository name',
        });
};

const handler = async (argv) => {
    const id        = argv.id;
    const repoOwner = argv['repo-owner'];
    const repoName  = argv['repo-name'];

    let pipelines;
    // TODO:need to decide for one way for error handeling
    if (id && repoOwner && repoName) {
        pipelines = await pipeline.getPipelineByNameAndRepo(id, repoOwner, repoName);
    } else if (id) {
        pipelines = await pipeline.getPipelineById(id);
    } else if (repoOwner && repoName) {
        pipelines = await pipeline.getAllByRepo(repoOwner, repoName);
    } else {
        pipelines = await pipeline.getAll();
    }

    specifyOutputForSingle(argv.output, pipelines);
};

module.exports = {
    command,
    builder,
    handler: wrapHandler(handler),
};
