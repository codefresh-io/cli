const debug = require('debug')('codefresh:cli:create:context');
const Command = require('../../Command');
const CFError = require('cf-errors');
const _ = require('lodash');
const { prepareKeyValueFromCLIEnvOption } = require('../../helpers/general');
const { pipeline } = require('../../../../logic').api;
const applyRoot = require('../root/apply.cmd');

const command = new Command({
    command: 'pipeline <id>',
    aliases: ['pip', 'pipelines'],
    parent: applyRoot,
    description: 'Apply changes to a pipeline',
    webDocs: {
        category: 'Pipelines',
        title: 'Update a single pipeline',
    },
    builder: (yargs) => {
        return yargs
            .positional('id', {
                describe: 'pipeline id',
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
            })
            .example('codefresh apply pipeline ID --context secret=my-list', "Add the 'my-list' secret context to pipeline ID")
            .example('codefresh apply pipeline ID --engine-cluster=my-cluster --engine-namespace=my-namespace', "Define pipeline ID executions to run on k8 cluster 'my-cluster' on namespace 'my-namespace'")
            .example('codefresh apply pipeline ID --default-engine', 'Define pipeline ID executions to run on the default engine of Codefresh');
    },
    handler: async (argv) => {
        let pipelineToUpdate = {};

        const pipelineId = argv.id;

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

        await pipeline.patchPipelineById(pipelineId, pipelineToUpdate);
        console.log(`Pipeline: ${pipelineId} patched`);
    },
});

module.exports = command;

