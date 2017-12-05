const debug                                            = require('debug')('codefresh:cli:create:context');
const CFError                                          = require('cf-errors');
const _                                                = require('lodash');
const { wrapHandler, prepareKeyValueFromCLIEnvOption } = require('../../../helper');
const { pipeline }                                     = require('../../../../../logic').api;

const command = 'pipeline <id|name> [repo-owner] [repo-name]';

const describe = 'Apply changes to a pipeline';

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
        })
        .option('cluster', {
            describe: 'K8 cluster name to use for execution',
        })
        .option('namespace', {
            describe: 'K8 namespace in the chosen cluster to use for execution',
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

    if (argv.cluster && argv.namespace) {
        pipelineToUpdate.clusterProvider = {
            active: true,
            selector: argv.cluster,
            namespace: argv.namespace,
        };
    }

    if (repoOwner && repoName) {
        await pipeline.patchPipelineByNameAndRepo(pipelineName, repoOwner, repoName, pipelineToUpdate);
    } else {
        await pipeline.patchPipelineById(pipelineId, pipelineToUpdate);
    }

    console.log(`Pipeline: ${pipelineName} patched`);
};

module.exports = {
    command,
    describe,
    builder,
    handler: wrapHandler(handler),
};
