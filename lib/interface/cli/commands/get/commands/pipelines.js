const debug           = require('debug')('codefresh:cli:create:context');
const CFError         = require('cf-errors');
const _               = require('lodash');
const { wrapHandler } = require('../../../helper');
const { pipeline }    = require('../../../../../logic').api;
const Table           = require('cli-table');
const columnify       = require('columnify');


const command = 'pipelines';

const builder = (yargs) => {
    return yargs
        .option('name', {
            describe: 'Pipeline name',
        })
        .option('repo-owner', {
            describe: 'Repository owner',
        })
        .option('repo-name', {
            describe: 'Repository name',
        });
};

const handler = async (argv) => {
    const pipelineName = argv.name;
    const repoOwner    = argv['repo-owner'];
    const repoName     = argv['repo-name'];

    let pipelines;
    if (pipelineName && repoOwner && repoName) {
        pipelines = [await pipeline.getPipelineByNameAndRepo(pipelineName, repoOwner, repoName)];
    } else if (repoOwner && repoName) {
        pipelines = await pipeline.getAllByRepo(repoOwner, repoName);
    } else {
        pipelines = await pipeline.getAll();
    }

    const res = [];
    _.forEach(pipelines, (pipeline) => {
        res.push({
            id: pipeline._id,
            name: pipeline.name,
            'repo-owner': pipeline.repoOwner,
            'repo-name': pipeline.repoName,
        });
    });

    const columns = columnify(res);
    console.log(columns);
};

module.exports = {
    command,
    builder,
    handler: wrapHandler(handler),
};
