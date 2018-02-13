const debug = require('debug')('codefresh:cli:generate:imagePullSecret');
const Command = require('../../Command');
const genCmd = require('../root/generate.cmd');
const {
    generateImagePullSecret,
} = require('./../../../../logic/api/kubernetes');

const command = new Command({
    command: 'image-pull-secret',
    parent: genCmd,
    description: 'Apply changes to a pipeline',
    webDocs: {
        category: 'Pipelines',
        title: 'Update Pipeline',
    },
    builder: (yargs) => {
        return yargs
            .option('cluster', {
                describe: 'cluster name',
                required: true,
            })
            .option('namespace', {
                describe: 'namespace name',
                default: 'default',
            })
            .option('registry', {
                describe: 'name of Docker registry to generate pull secret from',
                required: true,
            })
            .example('codefresh generate image-pull-secret --cluster cluster --registry cfcr');
    },
    handler: async (argv) => {
        const res = await generateImagePullSecret({
            cluster: argv.cluster,
            namespace: argv.namespace,
            registry: argv.registry,
        });
        console.log(`Image Pull Secret created with name: ${res.name}`);
        console.log('Avaliable via kubectl:');
        console.log(`kubectl get secret --context ${argv.cluster} --namespace ${argv.namespace} ${res.name}`);
    },
});

module.exports = command;

