const debug = require('debug')('codefresh:cli:generate:imagePullSecret');
const Command = require('../../Command');
const CFError = require('cf-errors');
const _ = require('lodash');
const genCmd = require('../root/generate.cmd');

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
        console.log(argv.cluster);
        console.log(argv.namespace);
        console.log(argv.registry);
    },
});

module.exports = command;

