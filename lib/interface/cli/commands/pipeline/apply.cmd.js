const debug = require('debug')('codefresh:cli:create:context');
const Command = require('../../Command');
const CFError = require('cf-errors');
const _ = require('lodash');
const { prepareKeyValueFromCLIEnvOption } = require('../../helpers/general');
const { pipeline } = require('../../../../logic').api;
const applyRoot = require('../root/apply.cmd');

const command = new Command({
    command: 'pipeline <id|name> [repo-owner] [repo-name]',
    aliases: ['pip'],
    description: 'Apply changes to a pipeline',
    builder: (yargs) => {
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
            .option('engine-cluster', {
                describe: 'K8 cluster name to use for execution',
            })
            .option('engine-namespace', {
                describe: 'K8 namespace in the chosen cluster to use for execution',
            })
            .option('default-engine', {
                describe: 'Use the default engine configured by the system',
                type: 'boolean',
            });
    },
    handler: async (argv) => {
        let pipelineToUpdate = {};

        const pipelineName = argv.name;
        const pipelineId = argv.id;
        const repoOwner = argv['repo-owner'];
        const repoName = argv['repo-name'];

        const contexts = prepareKeyValueFromCLIEnvOption(argv.context);
        pipelineToUpdate.contexts = _.map(contexts, (name, type) => {
            return {
                type,
                name,
            };
        });

        const cluster = argv['engine-cluster'];
        const namespace = argv['engine-namespace'];
        if (cluster && namespace) {
            pipelineToUpdate.clusterProvider = {
                active: true,
                selector: cluster,
                namespace: namespace,
            };
        }

        if (argv['default-engine']) {
            _.merge(pipelineToUpdate, {
                clusterProvider: {
                    active: false,
                },
            });
        }

        if (repoOwner && repoName) {
            await pipeline.patchPipelineByNameAndRepo(pipelineName, repoOwner, repoName, pipelineToUpdate);
        } else {
            await pipeline.patchPipelineById(pipelineId, pipelineToUpdate);
        }

        console.log(`Pipeline: ${pipelineName} patched`);
    },
});
applyRoot.subCommand(command);


module.exports = command;

