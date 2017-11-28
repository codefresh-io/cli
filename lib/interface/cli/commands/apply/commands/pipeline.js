const debug                                            = require('debug')('codefresh:cli:create:context');
const CFError                                          = require('cf-errors');
const _                                                = require('lodash');
const { wrapHandler, prepareKeyValueFromCLIEnvOption } = require('../../../helper');
const { pipeline }                                     = require('../../../../../logic').api;

const command = 'pipeline <id|name> [repo-owner] [repo-name]';

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
        })
        .option('context', {
            describe: 'context in form of: type=name',
            type: 'array',
            default: [],
            alias: 'c',
        });
};

const handler = async (argv) => {
    let pipelineToUpdate = {};

    const pipelineName = argv.name;
    const pipelineId   = argv.id;
    const repoOwner    = argv['repo-owner'];
    const repoName     = argv['repo-name'];

    const contexts            = prepareKeyValueFromCLIEnvOption(argv.context);
    pipelineToUpdate.contexts = _.map(contexts, (name, type) => {
        return {
            type,
            name,
        };
    });

    if (repoOwner && repoName) {
        await pipeline.patchPipelineByNameAndRepo(pipelineName, repoOwner, repoName, pipelineToUpdate);
    } else {
        await pipeline.patchPipelineById(pipelineId, pipelineToUpdate);
    }

    console.log(`Pipeline: ${pipelineName} patched`);
};

module.exports = {
    command,
    builder,
    handler: wrapHandler(handler),
};
