const Command = require('../../Command');
const { sdk } = require('../../../../logic');
const Output = require('../../../../output/Output');
const _ = require('lodash');

const install = new Command({
    root: true,
    command: 'set-helm-config <cluster>',
    description: 'Set Helm config',
    webDocs: {
        category: 'Predefined Pipelines',
        title: 'Set Helm config',
        weight: 20,
    },
    builder: (yargs) => {
        return yargs
            .positional('cluster', {
                describe: 'Cluster name on integrations page',
                required: true,
            })
            .option('version', {
                describe: 'Major part of helm version (helm2 | helm3)',
                alias: 'v',
            })
            .option('test-release-pipeline', {
                describe: 'Pipeline for testing release',
                alias: 't',
            })
            .option('rollback-pipeline', {
                describe: 'Pipeline for rollback',
                alias: 'r',
            })
            .option('delete-release-pipeline', {
                describe: 'Pipeline for deleting release',
                alias: 'd',
            })
            .option('tiller-namespace', {
                describe: 'Tiller namespace for helm2',
            })
            .option('release-namespaces', {
                describe: 'List of namespaces for using',
            })
            .example('codefresh set-helm-config cluster -v 2 -t pip1 -r pip2 -d pip3 --tiller-namespace kube-system', 'Helm2 config')
            .example('codefresh set-helm-config cluster -v 3 -t pip1 -r pip2 -d pip3 --release-namespaces ns1 --release-namespaces ns2', 'Helm3 config');
    },
    handler: async (argv) => {
        try {
            if (!['helm2', 'helm3'].includes(argv.version)) {
                throw new Error('Wrong version value');
            }
            let options = {};
            options.selector = argv.cluster;
            options.helmVersion = argv.version;

            const pipelines = await sdk.pipelines.getNames({});

            if (argv.deleteReleasePipeline) {
                const pipeline = _.find(pipelines, p => p.metadata.name === argv.deleteReleasePipeline);
                options.deleteReleasePipeline = _.get(pipeline, 'metadata.id');
                if (!options.deleteReleasePipeline) {
                    throw new Error(`Pipeline ${argv.deleteReleasePipeline} not found`);
                }
            }

            if (argv.testReleasePipeline) {
                const pipeline = _.find(pipelines, p => p.metadata.name === argv.testReleasePipeline);
                options.testReleasePipeline = _.get(pipeline, 'metadata.id');
                if (!options.testReleasePipeline) {
                    throw new Error(`Pipeline ${argv.testReleasePipeline} not found`);
                }
            }

            if (argv.rollbackPipeline) {
                const pipeline = _.find(pipelines, p => p.metadata.name === argv.rollbackPipeline);
                options.rollbackPipeline = _.get(pipeline, 'metadata.id');
                if (!options.rollbackPipeline) {
                    throw new Error(`Pipeline ${argv.rollbackPipeline} not found`);
                }
            }

            options = _.merge(options, _.pick(argv, ['releaseNamespaces', 'tillerNamespace']));

            await sdk.helm['cluster-config'].store(options);
            console.log('Helm config was set successfully');
            process.exit();
        } catch (err) {
            Output.printError(err);
            process.exit(1);
        }
    },
});

module.exports = install;
