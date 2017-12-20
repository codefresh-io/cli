const debug           = require('debug')('codefresh:cli:create:context');
const CFError         = require('cf-errors');
const _               = require('lodash');
const { wrapHandler } = require('../../../helper');
const { pipeline }    = require('../../../../../logic').api;
const yaml            = require('js-yaml');

const command = 'pipeline <id|name> [repo-owner] [repo-name]';

const describe = 'describe pipeline';

const builder = (yargs) => {
    return yargs
        .positional('id', {
            describe: 'pipeline id or name',
        })
        .positional('repo-owner', {
            describe: 'repository owner',
        })
        .positional('repo-name', {
            describe: 'repository name',
        });
};

const handler = async (argv) => {
    const id        = argv.id;
    const repoOwner = argv['repo-owner'];
    const repoName  = argv['repo-name'];

    let currPipeline;

    if (repoOwner && repoName) {
        currPipeline = await pipeline.getPipelineByNameAndRepo(id, repoOwner, repoName);
    } else {
        currPipeline = await pipeline.getPipelineById(id);
    }
    console.log(currPipeline.describe());
};

module.exports = {
    command,
    describe,
    builder,
    handler: wrapHandler(handler),
};
