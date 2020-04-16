const debug = require('debug')('codefresh:cli:create:context:secret-store:kubernetes');
const Command = require('../../../../../Command');
const CFError = require('cf-errors');
const cmd = require('../base.cmd');
const { sdk } = require('../../../../../../../logic');

const command = new Command({
    command: 'kubernetes-runtime <name>',
    parent: cmd,
    description: 'Create a secret-store Kubernetes-Runtime context',
    usage: 'Create a secret store to use hybrid runtime to access K8S secret/configmap and use it as secret store',
    webDocs: {
        category: 'Create Secret-Store Context',
        subCategory: 'kubernetes-Runtime',
        title: 'kubernetes-runtime',
        weight: 10,
    },
    builder: (yargs) => {
        yargs
            .option('runtimes', {
                describe: 'Names of the runtime-environment to be used as secret store',
                type: 'array',
                conflicts: ['any-runtime'],
            })
            .option('any-runtime', {
                describe: 'Use any hybrid runtime-environment as secret store',
                type: 'boolean',
                conflicts: ['runtimes'],
            })
            .option('resource-type', {
                describe: 'Type of the resource in Kubernetes',
                required: true,
                choices: ['secret', 'configmap'],
            })
            .option('resource-name', {
                describe: 'Name of the resource in Kubernetes',
                required: true,
            });
        return yargs;
    },
    handler: async (argv) => {
        let runtimes = [];
        if (argv.runtime) {
            runtimes = argv.runtime;
        }

        if (argv.anyRuntime) {
            runtimes.push('*');
        }
        const data = {
            apiVersion: 'v1',
            kind: 'context',
            metadata: {
                name: argv.name,
            },
            spec: {
                type: 'secret-store.kubernetes-runtime',
                data: {
                    sharingPolicy: argv.sharingPolicy,
                    resourceType: argv.resourceType,
                    resourceName: argv.resourceName,
                    runtimes,
                },
            },
        };


        if (!data.metadata.name || !data.spec.type) {
            throw new CFError('Name and type must be provided');
        }
        await sdk.contexts.create(data);
        console.log(`Context: ${data.metadata.name} created`);
    },
});

module.exports = command;
