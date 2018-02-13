const debug = require('debug')('codefresh:cli:generate:imagePullSecret');
const Command = require('../../Command');
const genCmd = require('../root/generate.cmd');
const {
    generateImagePullSecret,
} = require('./../../../../logic/api/kubernetes');

const command = new Command({
    command: 'image-pull-secret',
    parent: genCmd,
    description: 'Generate image pull secret on Kubernetes cluster from integrated Docker registry',
    usage: `
    For Kuberentes cluster to pull an image from your private registry it needs special secret typed as \`kubernetes.io/dockercfg\`.
    After this secret been created you can use them in pod template that lives in the same namespace.
    You can generate this secret from any integrated Docker registry on your account.
    More information about image pull secret can be found here: https://kubernetes.io/docs/tasks/configure-pod-container/pull-image-private-registry/`,
    webDocs: {
        category: 'More',
        title: 'Image Pull Secret',
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
            .example('codefresh generate image-pull-secret --cluster cluster --registry cfcr', 'Generate image pull secret');
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

