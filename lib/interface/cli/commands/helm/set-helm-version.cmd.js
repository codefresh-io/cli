const Command = require('../../Command');
const { sdk } = require('../../../../logic');
const Output = require('../../../../output/Output');

const install = new Command({
    root: true,
    command: 'set-helm-version <cluster> <version>',
    description: 'Set version of Helm used for specified cluster',
    webDocs: {
        category: 'Predefined Pipelines',
        title: 'Set version of Helm',
        weight: 20,
    },
    builder: (yargs) => {
        return yargs
            .positional('cluster', {
                describe: 'Cluster name on integrations page',
                required: true,
            })
            .positional('version', {
                describe: 'Major part of helm version (2 | 3)',
                type: 'string',
                required: true,
            })
            .example('codefresh set-helm-version cluster 2', 'Use helm2')
            .example('codefresh set-helm-version cluster 3', 'Use helm3');
    },
    handler: async (argv) => {
        try {
            if (!['2', '3'].includes(argv.version)) {
                throw new Error('Wrong version value');
            }
            const helm3 = argv.version === '3';

            const res = await sdk.clusters.helmVersion.update({ clusterId: argv.cluster, helm3 });
            console.log('Helm version was set successfully', res);
            process.exit();
        } catch (err) {
            Output.printError(err);
            process.exit(1);
        }
    },
});

module.exports = install;
